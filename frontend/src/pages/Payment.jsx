import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getPaymentDetails } from "../utils/api";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CARD_STYLE = {
  style: {
    base: {
      fontSize: "15px",
      color: "#1a1a1a",
      fontFamily: "Inter, system-ui, sans-serif",
      "::placeholder": { color: "#aaa" },
    },
    invalid: { color: "#c0392b" },
  },
};

function CheckoutForm({ clientSecret, amount, bottleName, buyerName }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setError(null);
    setPaying(true);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: { name: buyerName },
      },
    });

    if (result.error) {
      setError(result.error.message);
      setPaying(false);
    } else {
      setPaid(true);
    }
  };

  if (paid) {
    return (
      <div
        style={{
          background: "#f0faf0",
          border: "1px solid #c3e6cb",
          borderRadius: 12,
          padding: 28,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <h2 style={{ color: "#155724", fontSize: 20, marginBottom: 8 }}>
          Payment Successful!
        </h2>
        <p style={{ color: "#555", fontSize: 14 }}>
          Your payment for <strong>{bottleName}</strong> has been confirmed.
          Ownership will be recorded on the blockchain shortly and you'll
          receive a confirmation email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          background: "#f8f7f4",
          border: "1px solid #ece9e2",
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 20,
        }}
      >
        <CardElement options={CARD_STYLE} />
      </div>
      {error && (
        <p
          style={{
            color: "#c0392b",
            fontSize: 13,
            marginBottom: 16,
            background: "#fdf0ee",
            border: "1px solid #f5c6cb",
            borderRadius: 8,
            padding: "10px 14px",
          }}
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={paying || !stripe}
        className="btn btn-primary"
        style={{ width: "100%", padding: "12px 0", fontSize: 15 }}
      >
        {paying ? "Processing…" : `Pay £${(amount / 100).toFixed(2)}`}
      </button>
      <p style={{ color: "#aaa", fontSize: 11, textAlign: "center", marginTop: 12 }}>
        Secured by Stripe · Your card details are never stored
      </p>
    </form>
  );
}

export default function Payment() {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const paymentIntentId = new URLSearchParams(window.location.search).get("pi");

  useEffect(() => {
    if (!paymentIntentId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    getPaymentDetails(paymentIntentId)
      .then((r) => {
        if (r.data.status === "succeeded") {
          setDetails({ ...r.data, alreadyPaid: true });
        } else {
          setDetails(r.data);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [paymentIntentId]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="loading">Loading payment…</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
          <h2 style={{ color: "#7b1c2e" }}>Payment link not found</h2>
          <p style={{ color: "#888", fontSize: 14 }}>
            This link may be invalid or expired.
          </p>
        </div>
      </div>
    );
  }

  if (details.alreadyPaid) {
    return (
      <div
        style={{
          maxWidth: 480,
          margin: "60px auto",
          padding: "0 16px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "#f0faf0",
            border: "1px solid #c3e6cb",
            borderRadius: 12,
            padding: 28,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <h2 style={{ color: "#155724", fontSize: 20, marginBottom: 8 }}>
            Already Paid
          </h2>
          <p style={{ color: "#555", fontSize: 14 }}>
            This payment has already been completed. Check your email for the
            confirmation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "60px auto", padding: "0 16px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            width: 52,
            height: 52,
            background: "#7b1c2e",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            margin: "0 auto 12px",
          }}
        >
          🍷
        </div>
        <h1 style={{ fontSize: 22, color: "#1a1a1a", marginBottom: 4 }}>
          Complete Payment
        </h1>
        <p style={{ color: "#888", fontSize: 13 }}>Wine Chain · Secure Checkout</p>
      </div>

      {/* Order summary */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #ece9e2",
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
          You are purchasing
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 4 }}>
          {details.bottleName}
        </div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
          Buyer: {details.buyerName}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid #ece9e2",
            paddingTop: 12,
          }}
        >
          <span style={{ fontSize: 14, color: "#555" }}>Total</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#7b1c2e" }}>
            £{(details.amount / 100).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Stripe Elements */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #ece9e2",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 14 }}>
          Card details
        </div>
        <Elements stripe={stripePromise} options={{ clientSecret: details.clientSecret }}>
          <CheckoutForm
            clientSecret={details.clientSecret}
            amount={details.amount}
            bottleName={details.bottleName}
            buyerName={details.buyerName}
          />
        </Elements>
      </div>
    </div>
  );
}
