import React, { useEffect, useState, useCallback } from "react";
import {
  getBottles,
  deleteBottle,
  getListings,
  createListing,
  unlistBottle,
  confirmBuyNow,
  getOffers,
  acceptOffer,
  rejectOffer,
} from "../utils/api";
import QRModal from "../components/QRModal";
import exportToPDF from "../utils/exportPDF";
import { toast } from "react-toastify";

const TYPE_BADGE = {
  Red: "badge-red",
  White: "badge-white",
  Rosé: "badge-rose",
  Sparkling: "badge-sparkling",
  Dessert: "badge-dessert",
  Fortified: "badge-fortified",
};

const OVERLAY = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const MODAL = {
  background: "#fff",
  borderRadius: 14,
  padding: "28px 32px",
  width: "100%",
  maxWidth: 480,
  boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
  position: "relative",
};

const MODAL_WIDE = { ...MODAL, maxWidth: 640 };

export default function Inventory({ onNavigate, user }) {
  const [bottles, setBottles] = useState([]);
  const [listings, setListings] = useState({}); // bottleId → listing
  const [loading, setLoading] = useState(true);
  const [qrBottle, setQrBottle] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Sell modal
  const [sellBottle, setSellBottle] = useState(null);
  const [sellPrice, setSellPrice] = useState("");
  const [sellType, setSellType] = useState("Fixed Price");
  const [sellDesc, setSellDesc] = useState("");
  const [sellLoading, setSellLoading] = useState(false);

  // Offers modal
  const [offersBottle, setOffersBottle] = useState(null);
  const [offersListing, setOffersListing] = useState(null);
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (typeFilter) params.type = typeFilter;
    if (statusFilter) params.status = statusFilter;

    Promise.all([
      getBottles(params),
      getListings({ status: "Active,Pending" }),
    ])
      .then(([bottlesRes, listingsRes]) => {
        setBottles(bottlesRes.data.data);
        // Build a map: bottle._id → listing
        const map = {};
        (listingsRes.data.data || []).forEach((l) => {
          if (l.bottle) map[l.bottle._id] = l;
        });
        setListings(map);
      })
      .catch(() => toast.error("Failed to load inventory"))
      .finally(() => setLoading(false));
  }, [search, typeFilter, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from inventory?`)) return;
    try {
      await deleteBottle(id);
      toast.success("Bottle removed");
      fetchData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  // ── Sell ──────────────────────────────────────────────────────────────────
  const openSell = (b) => {
    setSellBottle(b);
    setSellPrice("");
    setSellType("Fixed Price");
    setSellDesc("");
  };

  const handleSell = async () => {
    if (!sellPrice || isNaN(Number(sellPrice)) || Number(sellPrice) <= 0) {
      toast.error("Enter a valid asking price");
      return;
    }
    setSellLoading(true);
    try {
      await createListing({
        bottleId: sellBottle._id,
        askingPrice: Number(sellPrice),
        listingType: sellType,
        description: sellDesc,
      });
      toast.success("Bottle listed on marketplace!");
      setSellBottle(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to list bottle");
    } finally {
      setSellLoading(false);
    }
  };

  const handleUnlist = async (listingId) => {
    if (!window.confirm("Remove this listing from the marketplace?")) return;
    try {
      await unlistBottle(listingId);
      toast.success("Listing removed");
      fetchData();
    } catch {
      toast.error("Failed to unlist");
    }
  };

  const handleConfirmSale = async (listingId) => {
    if (!window.confirm("Confirm this sale? This will transfer ownership and record it on the blockchain.")) return;
    try {
      await confirmBuyNow(listingId);
      toast.success("Sale confirmed! Ownership transferred.");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to confirm sale");
    }
  };

  // ── Offers ────────────────────────────────────────────────────────────────
  const openOffers = async (b, listing) => {
    setOffersBottle(b);
    setOffersListing(listing);
    setOffersLoading(true);
    setOffers([]);
    try {
      const res = await getOffers(listing._id);
      setOffers(res.data.data);
    } catch {
      toast.error("Failed to load offers");
    } finally {
      setOffersLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    if (!window.confirm("Accept this offer? This will transfer ownership on the blockchain.")) return;
    try {
      await acceptOffer(offersListing._id, offerId);
      toast.success("Offer accepted! Ownership transferred.");
      setOffersBottle(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to accept offer");
    }
  };

  const handleRejectOffer = async (offerId) => {
    try {
      await rejectOffer(offersListing._id, offerId);
      toast.success("Offer rejected");
      setOffers((prev) =>
        prev.map((o) => (o._id === offerId ? { ...o, status: "Rejected" } : o))
      );
    } catch {
      toast.error("Failed to reject offer");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-sub">All registered bottles on the blockchain</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn"
            onClick={() => exportToPDF(bottles)}
            disabled={bottles.length === 0}
          >
            📄 Export PDF
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate("add")}>
            + Register bottle
          </button>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
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
            <option value="">All types</option>
            {["Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified"].map(
              (t) => (
                <option key={t}>{t}</option>
              )
            )}
          </select>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {["Active", "Transferred", "Consumed", "Lost"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            className="btn btn-sm"
            onClick={() => {
              setSearch("");
              setTypeFilter("");
              setStatusFilter("");
            }}
          >
            Clear
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading…</div>
        ) : bottles.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🍷</div>No bottles found. Register your
            first bottle!
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Wine</th>
                  <th>Vintage</th>
                  <th>Type</th>
                  <th>Region</th>
                  <th>Qty</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Block hash</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bottles.map((b) => {
                  const listing = listings[b._id];
                  const isListed = listing && listing.status === "Active";
                  const isPending = listing && listing.status === "Pending";

                  return (
                    <tr key={b._id}>
                      <td>
                        <span className="hash-text">{b.bottleId}</span>
                      </td>
                      <td>
                        {b.imageUrl ? (
                          <img
                            src={b.imageUrl}
                            alt={b.name}
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 6,
                              border: "1px solid #ddd",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 6,
                              background: "#f0ede6",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 18,
                            }}
                          >
                            🍷
                          </div>
                        )}
                      </td>
                      <td>
                        <strong style={{ fontWeight: 500 }}>{b.name}</strong>
                        <br />
                        <span style={{ fontSize: 11, color: "#999" }}>
                          {b.producer}
                        </span>
                      </td>
                      <td>{b.vintage}</td>
                      <td>
                        <span
                          className={`badge ${TYPE_BADGE[b.type] || "badge-red"}`}
                        >
                          {b.type}
                        </span>
                      </td>
                      <td>{b.region}</td>
                      <td>{b.quantity}</td>
                      <td>{b.currentOwner}</td>
                      <td>
                        <span className={`badge badge-${b.status.toLowerCase()}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        <span className="hash-text">
                          {b.latestBlockHash?.substring(0, 12)}…
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          <button
                            className="btn btn-sm"
                            onClick={() => setQrBottle(b)}
                          >
                            QR
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => onNavigate("verify", b.bottleId)}
                          >
                            Verify
                          </button>

                          {/* Marketplace actions — only for logged-in users */}
                          {user && b.status !== "Transferred" && (
                            <>
                              {!isListed && !isPending && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => openSell(b)}
                                  title="List on Marketplace"
                                >
                                  Sell
                                </button>
                              )}
                              {isListed && (
                                <>
                                  <button
                                    className="btn btn-sm"
                                    style={{ background: "#e8f5e9", color: "#2e7d32" }}
                                    onClick={() => openOffers(b, listing)}
                                    title="View offers from buyers"
                                  >
                                    Offers
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleUnlist(listing._id)}
                                    title="Remove from marketplace"
                                  >
                                    Unlist
                                  </button>
                                </>
                              )}
                              {isPending && (
                                <>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      color: "#e67e22",
                                      fontWeight: 600,
                                      padding: "2px 6px",
                                      background: "#fff3e0",
                                      borderRadius: 4,
                                    }}
                                  >
                                    Pending sale
                                  </span>
                                  <button
                                    className="btn btn-sm"
                                    style={{ background: "#e8f5e9", color: "#2e7d32" }}
                                    onClick={() => handleConfirmSale(listing._id)}
                                    title="Confirm buyer purchase"
                                  >
                                    Confirm
                                  </button>
                                </>
                              )}
                            </>
                          )}

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(b.bottleId, b.name)}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <QRModal bottle={qrBottle} onClose={() => setQrBottle(null)} />

      {/* ── Sell Modal ───────────────────────────────────────────────────── */}
      {sellBottle && (
        <div style={OVERLAY} onClick={() => setSellBottle(null)}>
          <div style={MODAL} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 4, fontSize: 20 }}>List for Sale</h2>
            <p style={{ fontSize: 13, color: "#777", marginBottom: 20 }}>
              {sellBottle.name} {sellBottle.vintage}
            </p>

            <label style={{ fontWeight: 600, fontSize: 13 }}>
              Asking Price (£) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              placeholder="e.g. 150"
              style={{
                display: "block",
                width: "100%",
                marginTop: 6,
                marginBottom: 16,
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 14,
              }}
            />

            <label style={{ fontWeight: 600, fontSize: 13 }}>
              Listing Type *
            </label>
            <select
              value={sellType}
              onChange={(e) => setSellType(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                marginTop: 6,
                marginBottom: 16,
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 14,
              }}
            >
              <option value="Fixed Price">Fixed Price</option>
              <option value="Make Offer">Make Offer</option>
            </select>

            <label style={{ fontWeight: 600, fontSize: 13 }}>
              Description (optional)
            </label>
            <textarea
              value={sellDesc}
              onChange={(e) => setSellDesc(e.target.value)}
              placeholder="Condition, storage notes, etc."
              rows={3}
              style={{
                display: "block",
                width: "100%",
                marginTop: 6,
                marginBottom: 20,
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 14,
                resize: "vertical",
              }}
            />

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                className="btn"
                onClick={() => setSellBottle(null)}
                disabled={sellLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSell}
                disabled={sellLoading}
              >
                {sellLoading ? "Listing…" : "List on Marketplace"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Offers Modal ─────────────────────────────────────────────────── */}
      {offersBottle && (
        <div style={OVERLAY} onClick={() => setOffersBottle(null)}>
          <div style={MODAL_WIDE} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 4, fontSize: 20 }}>Buyer Offers</h2>
            <p style={{ fontSize: 13, color: "#777", marginBottom: 20 }}>
              {offersBottle.name} {offersBottle.vintage} · Listed at £
              {offersListing?.askingPrice}
            </p>

            {offersLoading ? (
              <div style={{ textAlign: "center", padding: 20, color: "#999" }}>
                Loading offers…
              </div>
            ) : offers.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 30,
                  color: "#aaa",
                  fontSize: 14,
                }}
              >
                No offers yet
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {offers.map((o) => (
                  <div
                    key={o._id}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 10,
                      padding: "14px 16px",
                      background: o.status === "Accepted" ? "#f0faf0" : o.status === "Rejected" ? "#fafafa" : "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: 15 }}>
                          £{o.offerPrice.toLocaleString()}
                        </strong>
                        <span
                          style={{
                            marginLeft: 10,
                            fontSize: 12,
                            padding: "2px 8px",
                            borderRadius: 12,
                            background:
                              o.status === "Accepted"
                                ? "#c8e6c9"
                                : o.status === "Rejected"
                                ? "#f5f5f5"
                                : "#fff3e0",
                            color:
                              o.status === "Accepted"
                                ? "#2e7d32"
                                : o.status === "Rejected"
                                ? "#999"
                                : "#e65100",
                          }}
                        >
                          {o.status}
                        </span>
                        <div
                          style={{ fontSize: 13, color: "#555", marginTop: 4 }}
                        >
                          {o.buyerName} · {o.buyerEmail}
                        </div>
                        {o.message && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "#888",
                              marginTop: 4,
                              fontStyle: "italic",
                            }}
                          >
                            "{o.message}"
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>
                          {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {o.status === "Pending" && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="btn btn-sm"
                            style={{ background: "#e8f5e9", color: "#2e7d32" }}
                            onClick={() => handleAcceptOffer(o._id)}
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRejectOffer(o._id)}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => setOffersBottle(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
