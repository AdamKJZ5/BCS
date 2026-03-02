import apiClient from '../utils/apiClient';

// Keeping interface for future use
// interface StripeConfigResponse {
//   success: boolean;
//   publishableKey: string;
// }

interface PaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  amount: number;
}

// Get Stripe publishable key
export async function getStripeConfig(): Promise<string> {
  try {
    const response = await apiClient.get('/payments/config');
    return response.data.publishableKey;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch Stripe configuration');
  }
}

// Create payment intent for invoice
export async function createPaymentIntent(invoiceId: string): Promise<PaymentIntentResponse> {
  try {
    const response = await apiClient.post('/payments/create-payment-intent', { invoiceId });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create payment intent');
  }
}
