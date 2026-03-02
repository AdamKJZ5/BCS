import apiClient from '../utils/apiClient';

interface ILineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface IPayment {
  amount: number;
  method: "stripe" | "cash" | "check" | "crypto";
  transactionId?: string;
  paidAt: string;
  notes?: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  leadId: string | {
    _id: string;
    name: string;
    email: string;
    phone: string;
    damageDescription?: string;
    vehicleInfo?: {
      make?: string;
      model?: string;
      year?: number;
      color?: string;
      vin?: string;
    };
  };
  customerId: string | {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  lineItems: ILineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  status: "draft" | "sent" | "viewed" | "paid" | "partially_paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  payments: IPayment[];
  notes?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface InvoicesResponse {
  success: boolean;
  data: Invoice[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

interface CreateInvoiceData {
  leadId: string;
  lineItems: ILineItem[];
  taxRate?: number;
  dueDate: string;
  notes?: string;
  internalNotes?: string;
}

interface UpdateInvoiceData {
  lineItems?: ILineItem[];
  taxRate?: number;
  dueDate?: string;
  notes?: string;
  internalNotes?: string;
  status?: Invoice['status'];
}

interface RecordPaymentData {
  amount: number;
  method: "cash" | "check" | "crypto";
  transactionId?: string;
  notes?: string;
}

// Admin: Create a new invoice
export async function createInvoice(data: CreateInvoiceData): Promise<Invoice> {
  try {
    const response = await apiClient.post('/invoices', data);
    return response.data.invoice;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create invoice');
  }
}

// Admin: Get all invoices with pagination
export async function getAllInvoices(page: number = 1, limit: number = 20): Promise<InvoicesResponse> {
  try {
    const response = await apiClient.get(`/invoices?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch invoices');
  }
}

// Admin: Get invoices for a specific lead
export async function getInvoicesByLead(leadId: string): Promise<Invoice[]> {
  try {
    const response = await apiClient.get(`/invoices/lead/${leadId}`);
    return response.data.invoices;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch lead invoices');
  }
}

// Admin: Get single invoice
export async function getInvoice(id: string): Promise<Invoice> {
  try {
    const response = await apiClient.get(`/invoices/${id}`);
    return response.data.invoice;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch invoice');
  }
}

// Admin: Update invoice
export async function updateInvoice(id: string, data: UpdateInvoiceData): Promise<Invoice> {
  try {
    const response = await apiClient.patch(`/invoices/${id}`, data);
    return response.data.invoice;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update invoice');
  }
}

// Admin: Send invoice to customer
export async function sendInvoice(id: string): Promise<Invoice> {
  try {
    const response = await apiClient.post(`/invoices/${id}/send`);
    return response.data.invoice;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to send invoice');
  }
}

// Admin: Record payment (for manual payments: cash, check, crypto)
export async function recordPayment(id: string, data: RecordPaymentData): Promise<Invoice> {
  try {
    const response = await apiClient.post(`/invoices/${id}/payment`, data);
    return response.data.invoice;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to record payment');
  }
}

// Admin: Delete invoice (only drafts)
export async function deleteInvoice(id: string): Promise<void> {
  try {
    await apiClient.delete(`/invoices/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete invoice');
  }
}

// Customer: Get my invoices
export async function getMyInvoices(): Promise<Invoice[]> {
  try {
    const response = await apiClient.get('/invoices/my/invoices');
    return response.data.invoices;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch invoices');
  }
}

// Customer: Mark invoice as viewed
export async function markInvoiceViewed(id: string): Promise<Invoice> {
  try {
    const response = await apiClient.post(`/invoices/${id}/viewed`);
    return response.data.invoice;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to mark invoice as viewed');
  }
}

export type { ILineItem, IPayment, CreateInvoiceData, UpdateInvoiceData, RecordPaymentData };
