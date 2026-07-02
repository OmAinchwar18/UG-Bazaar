const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

class PdfService {
  /**
   * Generates a professional tax invoice PDF and saves it to disk
   * @param {Object} order The Order object from database (with populated user and product details)
   * @param {Object} invoiceData Data related to invoice (invoiceNo, dates, totals)
   * @param {String} outputPath Path where the PDF should be saved
   */
  async generateInvoicePdf(order, invoiceData, outputPath) {
    // Ensure parent directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        // Define Color Palette
        const BRAND_GREEN = '#0c831f';
        const TEXT_DARK = '#222222';
        const TEXT_MUTED = '#666666';
        const LIGHT_GRAY = '#f8f9fa';
        const BORDER_COLOR = '#e2e8f0';

        // 1. BRAND HEADER SECTION WITH LOGO
        // Draw logo (a styled shopping bag)
        doc.strokeColor(BRAND_GREEN).lineWidth(2);
        // Handle of the bag
        doc.arc(70, 52, 10, Math.PI, 0, false).stroke();
        // Body of the bag
        doc.rect(55, 52, 30, 28).fillAndStroke(BRAND_GREEN, BRAND_GREEN);
        
        // Small star inside bag
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10).text('UG', 55, 62, { align: 'center', width: 30 });

        doc.fillColor(TEXT_DARK)
           .font('Helvetica-Bold')
           .fontSize(22)
           .text('UG BAZAAR', 100, 42);

        doc.font('Helvetica')
           .fontSize(8)
           .fillColor(TEXT_MUTED)
           .text('Bhangaram, Talodhi, Chandrapur, Maharashtra - 442903', 100, 64)
           .text('Phone: +91 99999 99999 | Email: contact@ugbazaar.com', 100, 76);

        // Title: TAX INVOICE
        doc.fillColor(BRAND_GREEN)
           .font('Helvetica-Bold')
           .fontSize(16)
           .text('TAX INVOICE', 400, 40, { align: 'right', width: 155 });

        doc.fillColor(TEXT_MUTED)
           .font('Helvetica')
           .fontSize(8)
           .text('(Original for Recipient)', 400, 58, { align: 'right', width: 155 });

        // Thin Header Line
        doc.strokeColor(BORDER_COLOR)
           .lineWidth(1)
           .moveTo(40, 95)
           .lineTo(555, 95)
           .stroke();

        // 2. INVOICE INFO & METADATA (Two-column layout)
        doc.y = 110;
        const colWidth = 250;
        
        // Left Column (Invoice Details)
        doc.fillColor(TEXT_DARK).font('Helvetica-Bold').fontSize(9).text('Invoice Details:', 40, 110);
        doc.font('Helvetica').fontSize(8).fillColor(TEXT_MUTED);
        doc.text(`Invoice No: `, 40, 125, { continued: true }).font('Helvetica-Bold').fillColor(TEXT_DARK).text(invoiceData.invoiceNo);
        doc.font('Helvetica').fillColor(TEXT_MUTED).text(`Invoice Date: `, 40, 137, { continued: true }).font('Helvetica-Bold').fillColor(TEXT_DARK).text(new Date(invoiceData.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
        doc.font('Helvetica').fillColor(TEXT_MUTED).text(`Payment Status: `, 40, 149, { continued: true }).font('Helvetica-Bold').fillColor(order.payment.status === 'paid' ? BRAND_GREEN : '#d97706').text(order.payment.status.toUpperCase());
        
        // Right Column (Order Details)
        doc.fillColor(TEXT_DARK).font('Helvetica-Bold').fontSize(9).text('Order Details:', 300, 110);
        doc.font('Helvetica').fontSize(8).fillColor(TEXT_MUTED);
        doc.text(`Order ID: `, 300, 125, { continued: true }).font('Helvetica-Bold').fillColor(TEXT_DARK).text(order.orderId);
        doc.font('Helvetica').fillColor(TEXT_MUTED).text(`Order Date: `, 300, 137, { continued: true }).font('Helvetica-Bold').fillColor(TEXT_DARK).text(new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
        doc.font('Helvetica').fillColor(TEXT_MUTED).text(`Payment Method: `, 300, 149, { continued: true }).font('Helvetica-Bold').fillColor(TEXT_DARK).text(order.payment.method.toUpperCase());

        // Thin Separator Line
        doc.strokeColor(BORDER_COLOR)
           .lineWidth(1)
           .moveTo(40, 170)
           .lineTo(555, 170)
           .stroke();

        // 3. SELLER VS BUYER DETAILS
        // Left Column: Seller Info
        doc.fillColor(TEXT_DARK).font('Helvetica-Bold').fontSize(9).text('Seller Details:', 40, 185);
        doc.font('Helvetica').fontSize(8).fillColor(TEXT_MUTED);
        doc.text('UG Bazaar Retail Private Limited', 40, 200)
           .text('Bhangaram Ward, Talodhi (Balapur)', 40, 210)
           .text('Taluka: Nagbhid, District: Chandrapur', 40, 220)
           .text('Maharashtra, India - 442903', 40, 230)
           .text('GSTIN: ', 40, 240, { continued: true }).font('Helvetica-Bold').fillColor(TEXT_DARK).text('27UGBAZ9999Z1ZD');

        // Right Column: Buyer Info (Billing & Shipping)
        doc.fillColor(TEXT_DARK).font('Helvetica-Bold').fontSize(9).text('Billing / Shipping Address:', 300, 185);
        doc.font('Helvetica').fontSize(8).fillColor(TEXT_MUTED);
        doc.text(order.deliveryAddress?.name || 'Customer Name', 300, 200)
           .text(`Mobile: ${order.deliveryAddress?.mobile || ''}`, 300, 210)
           .text(order.deliveryAddress?.line || '', 300, 220)
           .text(`${order.deliveryAddress?.village || ''}, ${order.deliveryAddress?.taluka || ''}`, 300, 230)
           .text(`${order.deliveryAddress?.district || ''}, Maharashtra - ${order.deliveryAddress?.pincode || ''}`, 300, 240);

        // Thin Separator Line
        doc.strokeColor(BORDER_COLOR)
           .lineWidth(1)
           .moveTo(40, 260)
           .lineTo(555, 260)
           .stroke();

        // 4. PRODUCT TABLE
        const tableY = 275;
        
        // Draw Table Header Background
        doc.rect(40, tableY, 515, 20).fill(LIGHT_GRAY);
        doc.fillColor(TEXT_DARK).font('Helvetica-Bold').fontSize(8);
        
        // Table Headers Columns Positions
        doc.text('SI.', 45, tableY + 6, { width: 25, align: 'center' });
        doc.text('Product Description', 75, tableY + 6, { width: 175 });
        doc.text('Qty', 255, tableY + 6, { width: 25, align: 'center' });
        doc.text('Unit Price', 285, tableY + 6, { width: 60, align: 'right' });
        doc.text('Tax Rate', 350, tableY + 6, { width: 50, align: 'right' });
        doc.text('GST (CGST+SGST)', 405, tableY + 6, { width: 85, align: 'right' });
        doc.text('Total', 495, tableY + 6, { width: 55, align: 'right' });

        let currentY = tableY + 20;

        // Draw Table Items
        order.items.forEach((item, index) => {
          // Calculate inclusive GST components (18%)
          const itemTotal = item.total;
          const taxableVal = itemTotal / 1.18;
          const totalGst = itemTotal - taxableVal;
          const unitPriceExclTax = taxableVal / item.qty;

          doc.fillColor(TEXT_DARK).font('Helvetica').fontSize(8);
          
          doc.text(String(index + 1), 45, currentY + 6, { width: 25, align: 'center' });
          
          // Product name might wrap
          doc.text(item.name || 'Unnamed Item', 75, currentY + 6, { width: 175 });
          
          doc.text(String(item.qty), 255, currentY + 6, { width: 25, align: 'center' });
          doc.text(`₹${unitPriceExclTax.toFixed(2)}`, 285, currentY + 6, { width: 60, align: 'right' });
          doc.text('18%', 350, currentY + 6, { width: 50, align: 'right' });
          doc.text(`₹${totalGst.toFixed(2)}`, 405, currentY + 6, { width: 85, align: 'right' });
          doc.text(`₹${itemTotal.toFixed(2)}`, 495, currentY + 6, { width: 55, align: 'right' });

          // Draw item border bottom
          doc.strokeColor(BORDER_COLOR)
             .lineWidth(0.5)
             .moveTo(40, currentY + 22)
             .lineTo(555, currentY + 22)
             .stroke();

          currentY += 22;
        });

        // 5. SUMMARY SECTION (Side-by-Side: QR Code on Left, Totals on Right)
        const summaryY = currentY + 15;
        
        // Generate QR code content
        const qrContent = `Order ID: ${order.orderId}\nInvoice No: ${invoiceData.invoiceNo}\nTotal Amount: INR ${order.total.toFixed(2)}`;
        
        try {
          const qrDataUrl = await QRCode.toDataURL(qrContent, { margin: 1, width: 80 });
          const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, "");
          // Draw QR code image on the left
          doc.image(Buffer.from(qrBase64, 'base64'), 40, summaryY, { width: 80 });
          doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(6).text('Scan QR code to verify invoice details.', 40, summaryY + 82, { width: 90, align: 'center' });
        } catch (qrErr) {
          console.error("QR Code generation failed inside PDF:", qrErr);
        }

        // Totals on the Right
        const totalsX = 350;
        doc.fillColor(TEXT_DARK).font('Helvetica').fontSize(8);

        // Calculate SGST / CGST sums from total GST
        const totalGstVal = order.subtotal - (order.subtotal / 1.18);
        const cgstVal = totalGstVal / 2;
        const sgstVal = totalGstVal / 2;

        let totalRowY = summaryY;
        
        const drawTotalRow = (label, value, isBold = false) => {
          doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica')
             .fillColor(TEXT_DARK)
             .text(label, totalsX, totalRowY, { width: 120, align: 'left' });
          doc.text(value, totalsX + 120, totalRowY, { width: 85, align: 'right' });
          totalRowY += 15;
        };

        const taxableSubtotal = order.subtotal - totalGstVal;

        drawTotalRow('Subtotal (Taxable):', `₹${taxableSubtotal.toFixed(2)}`);
        drawTotalRow('CGST (9.0%):', `₹${cgstVal.toFixed(2)}`);
        drawTotalRow('SGST (9.0%):', `₹${sgstVal.toFixed(2)}`);
        if (order.discount > 0) {
          drawTotalRow('Coupon Discount:', `- ₹${order.discount.toFixed(2)}`);
        }
        drawTotalRow('Delivery Charge:', order.deliveryCharge > 0 ? `₹${order.deliveryCharge.toFixed(2)}` : 'FREE');
        
        // Double separator line for grand total
        doc.strokeColor(BORDER_COLOR)
           .lineWidth(1)
           .moveTo(totalsX, totalRowY)
           .lineTo(555, totalRowY)
           .stroke();
        totalRowY += 4;

        drawTotalRow('Grand Total:', `₹${order.total.toFixed(2)}`, true);

        doc.strokeColor(BRAND_GREEN)
           .lineWidth(1.5)
           .moveTo(totalsX, totalRowY)
           .lineTo(555, totalRowY)
           .stroke();

        // 6. TERMS, DECLARATION & SIGNATURE FOOTER (Fixed position near bottom)
        const footerY = 700;

        // Draw light separator line
        doc.strokeColor(BORDER_COLOR)
           .lineWidth(0.5)
           .moveTo(40, footerY)
           .lineTo(555, footerY)
           .stroke();

        // Terms and conditions
        doc.fillColor(TEXT_MUTED).font('Helvetica-Bold').fontSize(7).text('Terms & Conditions:', 40, footerY + 10);
        doc.font('Helvetica').fontSize(6)
           .text('1. All items are inclusive of applicable GST (Central GST 9% + State GST 9%).', 40, footerY + 22)
           .text('2. This is a computer-generated tax invoice and does not require a physical signature.', 40, footerY + 30)
           .text('3. For any return or replacement claims, please retain this invoice copy.', 40, footerY + 38);

        // Signatory box on the right
        const sigX = 400;
        doc.fillColor(TEXT_DARK).font('Helvetica-Bold').fontSize(7).text('For UG Bazaar Retail Pvt. Ltd.', sigX, footerY + 10, { align: 'center', width: 155 });
        
        // Empty signature placeholder box
        doc.strokeColor(BORDER_COLOR)
           .rect(sigX + 25, footerY + 22, 105, 30)
           .stroke();
        
        // Add "Authorized Signatory" label under box
        doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(6).text('Authorized Signatory', sigX, footerY + 55, { align: 'center', width: 155 });

        // End PDF generation
        doc.end();

        writeStream.on('finish', () => {
          resolve();
        });

        writeStream.on('error', (err) => {
          reject(err);
        });

      } catch (err) {
        reject(err);
      }
    });
  }

  async generateAnalyticsPdf(data, outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        const BRAND_GREEN = '#0c831f';
        const TEXT_DARK = '#222222';
        const TEXT_MUTED = '#666666';
        const LIGHT_GRAY = '#f8f9fa';
        const BORDER_COLOR = '#e2e8f0';

        // 1. Header
        doc.strokeColor(BRAND_GREEN).lineWidth(2);
        doc.arc(70, 52, 10, Math.PI, 0, false).stroke();
        doc.rect(55, 52, 30, 28).fillAndStroke(BRAND_GREEN, BRAND_GREEN);
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10).text('UG', 55, 62, { align: 'center', width: 30 });

        doc.fillColor(TEXT_DARK).font('Helvetica-Bold').fontSize(20).text('UG BAZAAR', 100, 42);
        doc.fillColor(BRAND_GREEN).fontSize(14).text('ANALYTICS REPORT', 400, 42, { align: 'right', width: 155 });
        doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(8).text(`Generated: ${new Date().toLocaleString('en-IN')}`, 400, 60, { align: 'right', width: 155 });

        doc.strokeColor(BORDER_COLOR).lineWidth(1).moveTo(40, 95).lineTo(555, 95).stroke();

        // 2. Summary Grid (Key Metrics)
        doc.y = 110;
        doc.fillColor(TEXT_DARK).font('Helvetica-Bold').fontSize(12).text('Key Performance Indicators', 40, 110);
        
        // Stats Cards Backgrounds
        const cardWidth = 95;
        const cardHeight = 50;
        const stats = [
          { label: 'Total Revenue', value: `INR ${data.summary.totalRevenue.toFixed(2)}` },
          { label: 'Total Orders', value: String(data.summary.totalOrders) },
          { label: 'Total Customers', value: String(data.summary.totalCustomers) },
          { label: 'Active Products', value: String(data.summary.totalProducts) },
          { label: 'Low Stock Items', value: String(data.summary.lowStockProducts) }
        ];

        stats.forEach((stat, index) => {
          const x = 40 + index * 103;
          doc.rect(x, 130, cardWidth, cardHeight).fill(LIGHT_GRAY);
          doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(7).text(stat.label, x + 5, 136, { width: cardWidth - 10, align: 'center' });
          doc.fillColor(TEXT_DARK).font('Helvetica-Bold').fontSize(9).text(stat.value, x + 5, 152, { width: cardWidth - 10, align: 'center' });
        });

        // 3. Best Selling Products Table
        let currentY = 210;
        doc.fillColor(TEXT_DARK).font('Helvetica-Bold').fontSize(12).text('Top 5 Best Selling Products', 40, currentY);
        
        currentY += 20;
        doc.rect(40, currentY, 515, 18).fill(LIGHT_GRAY);
        doc.fillColor(TEXT_DARK).font('Helvetica-Bold').fontSize(8);
        doc.text('Rank', 45, currentY + 5, { width: 30 });
        doc.text('Product Name', 85, currentY + 5, { width: 250 });
        doc.text('Units Sold', 345, currentY + 5, { width: 80, align: 'right' });
        doc.text('Revenue Generated', 435, currentY + 5, { width: 110, align: 'right' });

        currentY += 18;
        data.bestSellers.forEach((item, index) => {
          doc.fillColor(TEXT_DARK).font('Helvetica').fontSize(8);
          doc.text(String(index + 1), 45, currentY + 5, { width: 30 });
          doc.text(item.name, 85, currentY + 5, { width: 250 });
          doc.text(String(item.sales), 345, currentY + 5, { width: 80, align: 'right' });
          doc.text(`₹${item.revenue.toFixed(2)}`, 435, currentY + 5, { width: 110, align: 'right' });

          doc.strokeColor(BORDER_COLOR).lineWidth(0.5).moveTo(40, currentY + 18).lineTo(555, currentY + 18).stroke();
          currentY += 18;
        });

        // 4. Category Revenue Breakdowns
        currentY += 20;
        doc.fillColor(TEXT_DARK).font('Helvetica-Bold').fontSize(12).text('Department / Category Sales Breakdown', 40, currentY);

        currentY += 20;
        doc.rect(40, currentY, 515, 18).fill(LIGHT_GRAY);
        doc.fillColor(TEXT_DARK).font('Helvetica-Bold').fontSize(8);
        doc.text('Category', 45, currentY + 5, { width: 200 });
        doc.text('Units Sold', 255, currentY + 5, { width: 100, align: 'right' });
        doc.text('Revenue Share (INR)', 365, currentY + 5, { width: 180, align: 'right' });

        currentY += 18;
        data.topCategories.forEach((cat) => {
          doc.fillColor(TEXT_DARK).font('Helvetica').fontSize(8);
          doc.text(cat.name, 45, currentY + 5, { width: 200 });
          doc.text(String(cat.count), 255, currentY + 5, { width: 100, align: 'right' });
          doc.text(`₹${cat.value.toFixed(2)}`, 365, currentY + 5, { width: 180, align: 'right' });

          doc.strokeColor(BORDER_COLOR).lineWidth(0.5).moveTo(40, currentY + 18).lineTo(555, currentY + 18).stroke();
          currentY += 18;
        });

        // Footer
        doc.strokeColor(BORDER_COLOR).lineWidth(0.5).moveTo(40, 750).lineTo(555, 750).stroke();
        doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(7).text('UG Bazaar Retail Private Limited — confidential analytics report.', 40, 760, { align: 'center', width: 515 });

        doc.end();
        writeStream.on('finish', () => resolve());
        writeStream.on('error', (err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new PdfService();
