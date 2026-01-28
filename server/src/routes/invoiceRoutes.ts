import { Router } from "express";
import { adminAuth } from "../middlewares/adminAuth";
import { authMiddleware } from "../middlewares/auth";
import {
  createInvoice,
  getAllInvoices,
  getInvoicesByLead,
  getInvoice,
  updateInvoice,
  sendInvoice,
  recordPayment,
  getMyInvoices,
  markInvoiceViewed,
  deleteInvoice,
  getInvoiceStats,
  downloadInvoicePDF,
  previewInvoicePDF
} from "../controllers/invoiceController";

const router = Router();

// Admin routes
router.get("/stats", adminAuth, getInvoiceStats);
router.post("/", adminAuth, createInvoice);
router.get("/", adminAuth, getAllInvoices);
router.get("/lead/:leadId", adminAuth, getInvoicesByLead);
router.get("/:id", adminAuth, getInvoice);
router.patch("/:id", adminAuth, updateInvoice);
router.post("/:id/send", adminAuth, sendInvoice);
router.post("/:id/payment", adminAuth, recordPayment);
router.delete("/:id", adminAuth, deleteInvoice);

// PDF routes (accessible by both admin and customer)
router.get("/:id/pdf", authMiddleware, downloadInvoicePDF);
router.get("/:id/pdf/preview", authMiddleware, previewInvoicePDF);

// Customer routes
router.get("/my/invoices", authMiddleware, getMyInvoices);
router.post("/:id/viewed", authMiddleware, markInvoiceViewed);

export default router;
