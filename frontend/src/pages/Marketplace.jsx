import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getListings,
  verifyBottle,
  submitBuyNow,
  makeOffer,
} from "../utils/api";

const TYPE_BADGE = {
  Red: "badge-red",
  White: "badge-white",
  "Rosé": "badge-rose",
  Sparkling: "badge-sparkling",
  Dessert: "badge-dessert",
  Fortified: "badge-fortified",
};

export default function Marketplace({ user, token, onNavigate }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [verifyModal, setVerifyModal] = useState(null); // { bottle, blocks }
  const [buyModal, setBuyModal] = useState(null); // listing
  const [offerModal, setOfferModal] = useState(null); // listing
  const [buyForm, setBuyForm] = useState({ name: "", email: "" });
  const [offerForm, setOfferForm] = useState({
    name: "",
    email: "",
    price: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchListings = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (typeFilter) params.type = typeFilter;
    if (minPrice !== "") params.minPrice = minPrice;
    if (maxPrice !== "") params.maxPrice = maxPrice;
    getListings(params)
      .then((r) => setListings(r.data.data))
      .catch(() => toast.error("Failed to load marketplace listings"))
      .finally(() => setLoading(false));
  }, [search, typeFilter, minPrice, maxPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchListings]);

  const handleVerify = async (listing) => {
    try {
      const res = await verifyBottle(listing.bottle.bottleId);
      setVerifyModal({ bottle: res.data.bottle, blocks: res.data.blocks });
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to verify bottle");
    }
  };

  const handleBuyNowSubmit = async (e) => {
    e.preventDefault();
    if (!buyForm.name || !buyForm.email) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      await submitBuyNow(buyModal._id, {
        buyerName: buyForm.name,
        buyerEmail: buyForm.email,
      });
      toast.success("Purchase request sent to seller!");
      setBuyModal(null);
      setBuyForm({ name: "", email: "" });
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to submit purchase request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!offerForm.name || !offerForm.email || !offerForm.price) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await makeOffer(offerModal._id, {
        buyerName: offerForm.name,
        buyerEmail: offerForm.email,
        offerPrice: Number(offerForm.price),
        message: offerForm.message,
      });
      toast.success("Offer submitted to seller!");
      setOfferModal(null);
      setOfferForm({ name: "", email: "", price: "", message: "" });
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to submit offer");
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 className="page-title">Marketplace</h1>
          <p className="page-sub">Browse and buy blockchain-verified wines</p>
        </div>
        {user && (
          <button
            className="btn btn-primary"
            onClick={() => onNavigate("inventory")}
          >
            + List a Bottle
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="toolbar" style={{ flexWrap: "wrap", gap: 10 }}>
          <input
            className="search-input"
            placeholder="Search name, region, producer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All listing types</option>
            <option value="Fixed Price">Fixed Price</option>
            <option value="Make Offer">Make Offer</option>
          </select>
          <input
            className="filter-select"
            type="number"
            placeholder="Min £"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            style={{ width: 90 }}
          />
          <input
            className="filter-select"
            type="number"
            placeholder="Max £"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={{ width: 90 }}
          />
          <button className="btn btn-sm" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading">Loading…</div>
      ) : listings.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🏪</div>
          No bottles listed for sale
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {listings.map((listing) => {
            const bottle = listing.bottle;
            if (!bottle) return null;
            return (
              <div
                key={listing._id}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid #ece9e2",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(123,28,46,0.12)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow = "none")
                }
              >
                {/* Image section */}
                <div
                  style={{ position: "relative", height: 200, background: "#f0ede6" }}
                >
                  {bottle.imageUrl ? (
                    <img
                      src={bottle.imageUrl}
                      alt={bottle.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 52,
                      }}
                    >
                      🍷
                    </div>
                  )}
                  {/* Blockchain Verified badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      background: "rgba(22, 160, 89, 0.92)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 8px",
                      borderRadius: 20,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    ⛓ Blockchain Verified
                  </div>
                  {/* Status badge for Pending */}
                  {listing.status === "Pending" && (
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: "rgba(180, 130, 0, 0.92)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "4px 8px",
                        borderRadius: 20,
                      }}
                    >
                      Pending
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div style={{ padding: "16px" }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#1a1a1a",
                      marginBottom: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {bottle.name}
                  </div>
                  <div
                    style={{
                      color: "#999",
                      fontSize: 12,
                      marginBottom: 6,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {bottle.producer}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#666",
                      marginBottom: 8,
                    }}
                  >
                    {bottle.vintage} · {bottle.region}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <span
                      className={`badge ${TYPE_BADGE[bottle.type] || "badge-red"}`}
                    >
                      {bottle.type}
                    </span>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid #ece9e2", margin: "0 0 12px 0" }} />

                  {/* Price row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 14,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#7b1c2e",
                      }}
                    >
                      £{listing.askingPrice.toLocaleString()}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#888",
                        background: "#f8f7f4",
                        padding: "3px 8px",
                        borderRadius: 10,
                        border: "1px solid #ece9e2",
                      }}
                    >
                      {listing.listingType}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleVerify(listing)}
                    >
                      History
                    </button>
                    {listing.status === "Active" && (
                      listing.listingType === "Fixed Price" ? (
                        <button
                          className="btn btn-sm btn-primary"
                          style={{ flex: 1 }}
                          onClick={() => {
                            setBuyModal(listing);
                            setBuyForm({ name: "", email: "" });
                          }}
                        >
                          Buy Now
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-primary"
                          style={{ flex: 1 }}
                          onClick={() => {
                            setOfferModal(listing);
                            setOfferForm({
                              name: "",
                              email: "",
                              price: "",
                              message: "",
                            });
                          }}
                        >
                          Make Offer
                        </button>
                      )
                    )}
                    {listing.status === "Pending" && (
                      <span
                        style={{
                          flex: 1,
                          textAlign: "center",
                          fontSize: 12,
                          color: "#888",
                          padding: "6px 0",
                        }}
                      >
                        Sale pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Verify / Provenance Modal */}
      {verifyModal && (
        <div
          className="modal-backdrop"
          onClick={() => setVerifyModal(null)}
        >
          <div
            className="modal"
            style={{ maxWidth: 640, width: "95%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 className="modal-title" style={{ margin: 0 }}>
                Blockchain Provenance
              </h2>
              <button
                className="modal-close"
                onClick={() => setVerifyModal(null)}
              >
                ✕
              </button>
            </div>

            {/* Bottle summary */}
            <div
              style={{
                display: "flex",
                gap: 16,
                marginBottom: 20,
                background: "#f8f7f4",
                borderRadius: 10,
                padding: 14,
                border: "1px solid #ece9e2",
              }}
            >
              {verifyModal.bottle.imageUrl ? (
                <img
                  src={verifyModal.bottle.imageUrl}
                  alt={verifyModal.bottle.name}
                  style={{
                    width: 70,
                    height: 70,
                    objectFit: "cover",
                    borderRadius: 8,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 70,
                    height: 70,
                    background: "#e8e3d8",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    flexShrink: 0,
                  }}
                >
                  🍷
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                  {verifyModal.bottle.name}
                </div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
                  {verifyModal.bottle.vintage} · {verifyModal.bottle.type} · {verifyModal.bottle.region}
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  {verifyModal.bottle.producer}
                </div>
                <div style={{ fontSize: 12, color: "#7b1c2e", marginTop: 4, fontWeight: 600 }}>
                  Current Owner: {verifyModal.bottle.currentOwner}
                </div>
              </div>
            </div>

            {/* Transfer history table */}
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: "#333" }}>
              Transfer History
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Price</th>
                    <th>Block Hash</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="badge badge-active">Registered</span></td>
                    <td style={{ color: "#aaa" }}>—</td>
                    <td>{verifyModal.bottle.currentOwner}</td>
                    <td style={{ color: "#aaa" }}>—</td>
                    <td>
                      <span className="hash-text">
                        {verifyModal.bottle.genesisBlockHash
                          ? verifyModal.bottle.genesisBlockHash.substring(0, 16) + "…"
                          : "—"}
                      </span>
                    </td>
                  </tr>
                  {verifyModal.bottle.transferHistory &&
                    verifyModal.bottle.transferHistory.map((t, i) => (
                      <tr key={i}>
                        <td><span className="badge badge-transferred">Transfer</span></td>
                        <td>{t.fromOwner}</td>
                        <td>{t.toOwner}</td>
                        <td>{t.price ? `£${t.price}` : "—"}</td>
                        <td>
                          <span className="hash-text">
                            {t.blockHash
                              ? t.blockHash.substring(0, 16) + "…"
                              : "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button
                className="btn btn-sm"
                onClick={() => setVerifyModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy Now Modal */}
      {buyModal && (
        <div
          className="modal-backdrop"
          onClick={() => setBuyModal(null)}
        >
          <div
            className="modal"
            style={{ maxWidth: 440, width: "95%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 className="modal-title" style={{ margin: 0 }}>
                Buy "{buyModal.bottle?.name} {buyModal.bottle?.vintage}"
              </h2>
              <button
                className="modal-close"
                onClick={() => setBuyModal(null)}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: "#f8f7f4",
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 20,
                border: "1px solid #ece9e2",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 13, color: "#555" }}>Asking price:</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#7b1c2e" }}>
                £{buyModal.askingPrice?.toLocaleString()}
              </span>
            </div>

            <form onSubmit={handleBuyNowSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={buyForm.name}
                  onChange={(e) =>
                    setBuyForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={buyForm.email}
                  onChange={(e) =>
                    setBuyForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  marginTop: 20,
                }}
              >
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setBuyModal(null)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Sending…" : "Send Purchase Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Make Offer Modal */}
      {offerModal && (
        <div
          className="modal-backdrop"
          onClick={() => setOfferModal(null)}
        >
          <div
            className="modal"
            style={{ maxWidth: 440, width: "95%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 className="modal-title" style={{ margin: 0 }}>
                Make an Offer — {offerModal.bottle?.name} {offerModal.bottle?.vintage}
              </h2>
              <button
                className="modal-close"
                onClick={() => setOfferModal(null)}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: "#f8f7f4",
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 20,
                border: "1px solid #ece9e2",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 13, color: "#555" }}>Asking price:</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#7b1c2e" }}>
                £{offerModal.askingPrice?.toLocaleString()}
              </span>
            </div>

            <form onSubmit={handleOfferSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={offerForm.name}
                  onChange={(e) =>
                    setOfferForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={offerForm.email}
                  onChange={(e) =>
                    setOfferForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Your Offer (£)</label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  value={offerForm.price}
                  onChange={(e) =>
                    setOfferForm((f) => ({ ...f, price: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Message (optional)</label>
                <textarea
                  placeholder="Add a message to the seller…"
                  value={offerForm.message}
                  onChange={(e) =>
                    setOfferForm((f) => ({ ...f, message: e.target.value }))
                  }
                  rows={3}
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  marginTop: 20,
                }}
              >
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setOfferModal(null)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Sending…" : "Submit Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
