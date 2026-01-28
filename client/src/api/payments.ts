const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

interface StripeConfigResponse {
  success: boolean;
  publishableKey: string;
}

interface PaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  amount: number;
}

// Get Stripe publishable key
export async function getStripeConfig(): Promise<string> {
  const res = await fetch(`${API_BASE}/api/payments/config`);

  if (!res.ok) {
    throw new Error('Failed to fetch Stripe configuration');
  }

  const result: StripeConfigResponse = await res.json();
  return result.publishableKey;
}

// Create payment intent for invoice
export async function createPaymentIntent(invoiceId: string): Promise<PaymentIntentResponse> {
  const res = await fetch(`${API_BASE}/api/payments/create-payment-intent`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ invoiceId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create payment intent');
  }

  return res.json();
}
