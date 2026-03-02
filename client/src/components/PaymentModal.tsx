import { useState, useEffect } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Invoice } from "../api/invoices";
import { getStripeConfig, createPaymentIntent } from "../api/payments";
import useModal from "../hooks/useModal";

interface PaymentModalProps {
  invoice: Invoice;
  onClose: () => void;
  onSuccess: () => void;
}

let stripePromise: Promise<Stripe | null> | null = null;

const getStripePromise = async () => {
  if (!stripePromise) {
    const publishableKey = await getStripeConfig();
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

const PaymentForm = ({
  invoice,
  onClose,
  onSuccess,
}: PaymentModalProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const modal = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    await modal.handleSubmit(
      async () => {
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/customer/dashboard`,
          },
          redirect: "if_required",
        });

        if (error) {
          throw new Error(error.message || "Payment failed");
        }

        return true;
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <PaymentElement />

      {modal.error && <div style={styles.error}>{modal.error}</div>}

      <div style={styles.buttonGroup}>
        <button
          type="button"
          onClick={onClose}
          disabled={modal.loading}
          style={styles.cancelButton}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || modal.loading}
          style={styles.submitButton}
        >
          {modal.loading ? "Processing..." : `Pay $${invoice.amountDue.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
};

const PaymentModal = ({ invoice, onClose, onSuccess }: PaymentModalProps) => {
  const modal = useModal();
  const [clientSecret, setClientSecret] = useState("");
  const [stripePromiseState, setStripePromiseState] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    const initPayment = async () => {
      modal.setLoading(true);
      try {
        // Load Stripe
        const stripe = await getStripePromise();
        setStripePromiseState(Promise.resolve(stripe));

        // Create payment intent
        const response = await createPaymentIntent(invoice._id);
        setClientSecret(response.clientSecret);
      } catch (err: any) {
        modal.setError(err.message || "Failed to initialize payment");
      } finally {
        modal.setLoading(false);
      }
    };

    initPayment();
  }, [invoice._id]);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Pay Invoice</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
        </div>

        <div style={styles.invoiceInfo}>
          <div style={styles.invoiceRow}>
            <span>Invoice:</span>
            <strong>{invoice.invoiceNumber}</strong>
          </div>
          <div style={styles.invoiceRow}>
            <span>Amount Due:</span>
            <strong style={{ fontSize: "1.5rem", color: "#0047AB" }}>
              ${invoice.amountDue.toFixed(2)}
            </strong>
          </div>
        </div>

        {modal.loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading payment form...</p>
          </div>
        )}

        {modal.error && (
          <div style={styles.errorContainer}>
            <div style={styles.error}>{modal.error}</div>
            <button onClick={onClose} style={styles.cancelButton}>
              Close
            </button>
          </div>
        )}

        {!modal.loading && !modal.error && clientSecret && stripePromiseState && (
          <Elements
            stripe={stripePromiseState}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#0047AB",
                },
              },
            }}
          >
            <PaymentForm invoice={invoice} onClose={onClose} onSuccess={onSuccess} />
          </Elements>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "2rem",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto" as const,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "2px solid #e0e0e0",
  },
  title: {
    margin: 0,
    fontSize: "1.75rem",
    color: "#0047AB",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#666",
    padding: "0.25rem",
    lineHeight: 1,
  },
  invoiceInfo: {
    marginBottom: "1.5rem",
    padding: "1rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
  },
  invoiceRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
    fontSize: "1.1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
  },
  submitButton: {
    flex: 1,
    padding: "0.75rem",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  cancelButton: {
    flex: 1,
    padding: "0.75rem",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  error: {
    padding: "1rem",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "4px",
    border: "1px solid #f5c6cb",
  },
  loadingContainer: {
    textAlign: "center" as const,
    padding: "2rem",
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  spinner: {
    width: "40px",
    height: "40px",
    margin: "0 auto 1rem",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #0047AB",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

// Add keyframe animation for spinner (you may need to add this to your global CSS)
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default PaymentModal;
