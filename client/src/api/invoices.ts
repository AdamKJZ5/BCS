const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

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
  const res = await fetch(`${API_BASE}/api/invoices`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create invoice');
  }

  const result = await res.json();
  return result.invoice;
}

// Admin: Get all invoices with pagination
export async function getAllInvoices(page: number = 1, limit: number = 20): Promise<InvoicesResponse> {
  const res = await fetch(`${API_BASE}/api/invoices?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch invoices');
  }

  return res.json();
}

// Admin: Get invoices for a specific lead
export async function getInvoicesByLead(leadId: string): Promise<Invoice[]> {
  const res = await fetch(`${API_BASE}/api/invoices/lead/${leadId}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch lead invoices');
  }

  const result = await res.json();
  return result.invoices;
}

// Admin: Get single invoice
export async function getInvoice(id: string): Promise<Invoice> {
  const res = await fetch(`${API_BASE}/api/invoices/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch invoice');
  }

  const result = await res.json();
  return result.invoice;
}

// Admin: Update invoice
export async function updateInvoice(id: string, data: UpdateInvoiceData): Promise<Invoice> {
  const res = await fetch(`${API_BASE}/api/invoices/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update invoice');
  }

  const result = await res.json();
  return result.invoice;
}

// Admin: Send invoice to customer
export async function sendInvoice(id: string): Promise<Invoice> {
  const res = await fetch(`${API_BASE}/api/invoices/${id}/send`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to send invoice');
  }

  const result = await res.json();
  return result.invoice;
}

// Admin: Record payment (for manual payments: cash, check, crypto)
export async function recordPayment(id: string, data: RecordPaymentData): Promise<Invoice> {
  const res = await fetch(`${API_BASE}/api/invoices/${id}/payment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to record payment');
  }

  const result = await res.json();
  return result.invoice;
}

// Admin: Delete invoice (only drafts)
export async function deleteInvoice(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/invoices/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete invoice');
  }
}

// Customer: Get my invoices
export async function getMyInvoices(): Promise<Invoice[]> {
  const res = await fetch(`${API_BASE}/api/invoices/my/invoices`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch invoices');
  }

  const result = await res.json();
  return result.invoices;
}

// Customer: Mark invoice as viewed
export async function markInvoiceViewed(id: string): Promise<Invoice> {
  const res = await fetch(`${API_BASE}/api/invoices/${id}/viewed`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to mark invoice as viewed');
  }

  const result = await res.json();
  return result.invoice;
}

export type { ILineItem, IPayment, CreateInvoiceData, UpdateInvoiceData, RecordPaymentData };
