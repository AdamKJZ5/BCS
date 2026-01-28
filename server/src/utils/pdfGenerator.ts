import PDFDocument from 'pdfkit';
import { IInvoice } from '../models/Invoice';
import fs from 'fs';
import path from 'path';

interface InvoiceData extends Omit<IInvoice, keyof Document> {
  _id: any;
  customerId: any;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Generate PDF invoice
 */
export const generateInvoicePDF = async (
  invoice: InvoiceData,
  outputPath?: string
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Invoice ${invoice.invoiceNumber}`,
          Author: 'Bellevue Collision Services',
          Subject: `Invoice for ${invoice.customerId?.name || 'Customer'}`,
        },
      });

      const chunks: Buffer[] = [];

      // Collect PDF chunks
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header - Company Info
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Bellevue Collision Services', 50, 50);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text('123 Main Street', 50, 75)
        .text('Bellevue, WA 98004', 50, 88)
        .text('Phone: (425) 555-0100', 50, 101)
        .text('Email: info@bellevuecollision.com', 50, 114);

      // Invoice Title
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('INVOICE', 400, 50, { align: 'right' });

      // Invoice Number and Date
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Invoice #: ${invoice.invoiceNumber}`, 400, 80, { align: 'right' })
        .text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 400, 93, {
          align: 'right',
        })
        .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 400, 106, {
          align: 'right',
        });

      // Status Badge
      const statusColors: Record<string, string> = {
        draft: '#6B7280',
        sent: '#3B82F6',
        paid: '#10B981',
        partially_paid: '#F59E0B',
        overdue: '#EF4444',
        cancelled: '#6B7280',
      };

      const statusColor = statusColors[invoice.status] || '#6B7280';
      const statusY = 120;

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(statusColor)
        .text(invoice.status.toUpperCase().replace('_', ' '), 400, statusY, {
          align: 'right',
        })
        .fillColor('#000000');

      // Customer Info
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Bill To:', 50, 160);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(invoice.customerId?.name || 'Customer Name', 50, 178)
        .text(invoice.customerId?.email || '', 50, 191)
        .text(invoice.customerId?.phone || '', 50, 204);

      // Horizontal line
      doc
        .strokeColor('#E5E7EB')
        .lineWidth(1)
        .moveTo(50, 240)
        .lineTo(545, 240)
        .stroke();

      // Table Header
      const tableTop = 260;
      const descriptionX = 50;
      const quantityX = 320;
      const priceX = 380;
      const amountX = 480;

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#374151')
        .text('Description', descriptionX, tableTop)
        .text('Qty', quantityX, tableTop)
        .text('Price', priceX, tableTop)
        .text('Amount', amountX, tableTop)
        .fillColor('#000000');

      // Table line
      doc
        .strokeColor('#E5E7EB')
        .lineWidth(1)
        .moveTo(50, tableTop + 15)
        .lineTo(545, tableTop + 15)
        .stroke();

      // Line Items
      let yPosition = tableTop + 30;
      doc.fontSize(9).font('Helvetica');

      invoice.items.forEach((item, index) => {
        // Check if we need a new page
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        const itemTotal = item.quantity * item.unitPrice;

        doc
          .text(item.description, descriptionX, yPosition, {
            width: 250,
            lineGap: 2,
          })
          .text(item.quantity.toString(), quantityX, yPosition)
          .text(`$${item.unitPrice.toFixed(2)}`, priceX, yPosition)
          .text(`$${itemTotal.toFixed(2)}`, amountX, yPosition);

        yPosition += 30;

        // Add separator line
        if (index < invoice.items.length - 1) {
          doc
            .strokeColor('#F3F4F6')
            .lineWidth(0.5)
            .moveTo(50, yPosition - 5)
            .lineTo(545, yPosition - 5)
            .stroke();
        }
      });

      // Summary section
      yPosition += 20;
      const summaryX = 400;

      // Subtotal
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Subtotal:', summaryX, yPosition)
        .text(`$${invoice.subtotal.toFixed(2)}`, summaryX + 100, yPosition, {
          align: 'right',
        });

      yPosition += 20;

      // Tax
      doc
        .text(`Tax (${invoice.taxRate}%):`, summaryX, yPosition)
        .text(`$${invoice.tax.toFixed(2)}`, summaryX + 100, yPosition, {
          align: 'right',
        });

      yPosition += 20;

      // Discount (if any)
      if (invoice.discount > 0) {
        doc
          .text('Discount:', summaryX, yPosition)
          .text(`-$${invoice.discount.toFixed(2)}`, summaryX + 100, yPosition, {
            align: 'right',
          });
        yPosition += 20;
      }

      // Total line
      doc
        .strokeColor('#E5E7EB')
        .lineWidth(1)
        .moveTo(summaryX, yPosition)
        .lineTo(545, yPosition)
        .stroke();

      yPosition += 15;

      // Total
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Total:', summaryX, yPosition)
        .text(`$${invoice.total.toFixed(2)}`, summaryX + 100, yPosition, {
          align: 'right',
        });

      yPosition += 25;

      // Amount Paid
      if (invoice.amountPaid > 0) {
        doc
          .fontSize(10)
          .font('Helvetica')
          .text('Amount Paid:', summaryX, yPosition)
          .text(`$${invoice.amountPaid.toFixed(2)}`, summaryX + 100, yPosition, {
            align: 'right',
          });
        yPosition += 20;

        // Amount Due
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .fillColor('#DC2626')
          .text('Amount Due:', summaryX, yPosition)
          .text(`$${invoice.amountDue.toFixed(2)}`, summaryX + 100, yPosition, {
            align: 'right',
          })
          .fillColor('#000000');
      }

      // Payment History
      if (invoice.payments && invoice.payments.length > 0) {
        yPosition += 40;

        // Check if we need a new page
        if (yPosition > 650) {
          doc.addPage();
          yPosition = 50;
        }

        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Payment History', 50, yPosition);

        yPosition += 20;

        doc.fontSize(9).font('Helvetica');

        invoice.payments.forEach((payment) => {
          const paymentDate = new Date(payment.paidAt).toLocaleDateString();
          doc
            .text(`${paymentDate}`, 50, yPosition)
            .text(payment.method.toUpperCase(), 150, yPosition)
            .text(`$${payment.amount.toFixed(2)}`, 250, yPosition);

          if (payment.notes) {
            yPosition += 12;
            doc.fontSize(8).fillColor('#6B7280').text(payment.notes, 50, yPosition);
            doc.fontSize(9).fillColor('#000000');
          }

          yPosition += 20;
        });
      }

      // Notes
      if (invoice.notes) {
        yPosition += 30;

        // Check if we need a new page
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Notes:', 50, yPosition);

        yPosition += 15;

        doc
          .fontSize(9)
          .font('Helvetica')
          .text(invoice.notes, 50, yPosition, {
            width: 495,
            align: 'left',
          });
      }

      // Footer
      const footerY = doc.page.height - 80;
      doc
        .fontSize(8)
        .fillColor('#6B7280')
        .text(
          'Thank you for your business!',
          50,
          footerY,
          {
            align: 'center',
            width: 495,
          }
        )
        .text(
          'For questions about this invoice, please contact us at info@bellevuecollision.com',
          50,
          footerY + 15,
          {
            align: 'center',
            width: 495,
          }
        );

      // Finalize the PDF
      doc.end();

      // If output path is provided, also save to file
      if (outputPath) {
        const fileStream = fs.createWriteStream(outputPath);
        doc.pipe(fileStream);
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate estimate/quote PDF (similar to invoice but with different labels)
 */
export const generateEstimatePDF = async (
  invoice: InvoiceData,
  outputPath?: string
): Promise<Buffer> => {
  // Use same structure as invoice but change labels
  return generateInvoicePDF(invoice, outputPath);
};
