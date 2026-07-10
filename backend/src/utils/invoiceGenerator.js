const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Dynamically converts numeric values to Indian Rupee Words format
 * @param {number} num 
 * @returns {string}
 */
const numberToWords = (num) => {
   const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
   const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];

   const convertThreeDigit = (n) => {
      let str = '';
      if (n >= 100) {
         str += a[Math.floor(n / 100)] + 'Hundred ';
         n %= 100;
      }
      if (n >= 20) {
         str += b[Math.floor(n / 10)] + ' ';
         n %= 10;
      }
      if (n > 0) {
         str += a[n];
      }
      return str;
   };

   if (num === 0) return 'Zero';

   let n = Math.floor(num);
   let words = '';

   if (n >= 10000000) {
      words += convertThreeDigit(Math.floor(n / 10000000)) + 'Crore ';
      n %= 10000000;
   }
   if (n >= 100000) {
      words += convertThreeDigit(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
   }
   if (n >= 1000) {
      words += convertThreeDigit(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
   }
   words += convertThreeDigit(n);

   let paise = Math.round((num - Math.floor(num)) * 100);
   if (paise > 0) {
      words += 'and ' + convertThreeDigit(paise) + 'Paise ';
   }

   return words.trim() + ' Rupees Only';
};

/**
 * Generates an ultra-premium corporate GST Tax Invoice PDF mirroring the uploaded sample.
 * @param {Object} data - Invoice details
 * @returns {Promise<string>} - Absolute path to the generated PDF
 */
const generateInvoicePDF = (data) => {
   return new Promise((resolve, reject) => {
      try {
         const {
            invoiceNumber,
            companyName,
            gstin = 'Not Provided',
            billingAddress = 'Not Provided',
            billingEmail = '',
            planName = 'Basic Plan',
            subtotal = 999,
            gstAmount = 179.82,
            totalAmount = 1178.82,
            transactionId = 'pay_N8dX1a2b3c4d5e',
            paymentMethod = 'UPI',
            issuedDate = new Date(),
            expiryDate = new Date(new Date().setDate(new Date().getDate() + 30))
         } = data;

         // Ensure upload directory exists
         const dirPath = path.join(__dirname, '..', '..', 'uploads', 'invoices');
         if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
         }

         const fileName = `${invoiceNumber}.pdf`;
         const filePath = path.join(dirPath, fileName);
         const doc = new PDFDocument({ margin: 40, size: 'A4', autoPageBreak: false });

         const stream = fs.createWriteStream(filePath);
         doc.pipe(stream);

         // --- COLORS ---
         const brandDark = '#0f172a';      // Slate 900
         const brandMuted = '#475569';     // Slate 600
         const brandLight = '#64748b';     // Slate 500
         const primaryIndigo = '#4f46e5';  // Indigo 600 (WorknAI theme color)
         const borderGray = '#e2e8f0';     // Gray 200
         const bgSlate = '#f8fafc';        // Slate 50
         const textGreen = '#166534';      // Green 800
         const bgGreen = '#f0fdf4';        // Green 50

         // --- HEADER BRANDING LOGO (TOP LEFT) ---
         doc.save();
         doc.translate(40, 40);

         // Left curve
         doc.fillColor(primaryIndigo)
            .moveTo(0, 10)
            .bezierCurveTo(5, 0, 15, 0, 20, 10)
            .lineTo(10, 30)
            .bezierCurveTo(5, 40, -5, 40, -10, 30)
            .closePath()
            .fill();

         // Right curve
         doc.fillColor('#818cf8')
            .moveTo(12, 10)
            .bezierCurveTo(17, 0, 27, 0, 32, 10)
            .lineTo(22, 30)
            .bezierCurveTo(17, 40, 7, 40, 2, 30)
            .closePath()
            .fill();
         doc.restore();

         // Brand Text next to Logo
         doc.fillColor(brandDark)
            .fontSize(16)
            .font('Helvetica-Bold')
            .text('ITjobx', 80, 42);

         doc.fillColor(brandLight)
            .fontSize(8)
            .font('Helvetica')
            .text('AI Powered Hiring, Simplified', 80, 58);

         // Provider Registered Corporate Office Address
         doc.fillColor(brandMuted)
            .fontSize(8)
            .font('Helvetica-Bold')
            .text('ITjobx Technologies Pvt. Ltd.', 40, 80)
            .font('Helvetica')
            .text('2nd Floor, B-25, Sector 63', 40, 91)
            .text('Noida, Uttar Pradesh - 201301, India', 40, 101)
            .text(`GSTIN: 09AABCW1234A1Z5   |   PAN: AABCW1234A`, 40, 111);


         // --- TITLE "INVOICE" (TOP CENTER) ---
         doc.fillColor(primaryIndigo)
            .fontSize(22)
            .font('Helvetica-Bold')
            .text('INVOICE', 120, 50, { align: 'center', width: 350 });


         // --- METADATA BLOCK (TOP RIGHT) ---
         const metaX = 390;
         doc.fillColor(brandDark).fontSize(8).font('Helvetica');

         doc.font('Helvetica-Bold').text('Invoice No:', metaX, 42);
         doc.fillColor(primaryIndigo).text(invoiceNumber, 470, 42, { align: 'right', width: 85 });

         doc.fillColor(brandDark).font('Helvetica-Bold').text('Invoice Date:', metaX, 54);
         doc.font('Helvetica').text(new Date(issuedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), 470, 54, { align: 'right', width: 85 });

         doc.font('Helvetica-Bold').text('Due Date:', metaX, 66);
         doc.font('Helvetica').text(new Date(issuedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), 470, 66, { align: 'right', width: 85 });

         doc.font('Helvetica-Bold').text('Billing Period:', metaX, 78);
         const periodStr = `${new Date(issuedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
         doc.font('Helvetica').text(periodStr, 460, 78, { align: 'right', width: 95 });

         doc.font('Helvetica-Bold').text('Payment Status:', metaX, 90);

         // Paid status label button green pill - adjusted coordinates for straight line alignment
         doc.roundedRect(515, 87, 40, 13, 3)
            .fillColor(bgGreen)
            .fillAndStroke('#bbf7d0', bgGreen);
         doc.fillColor(textGreen)
            .fontSize(7.5)
            .font('Helvetica-Bold')
            .text('Paid', 515, 90, { align: 'center', width: 40 });


         // --- LINE DIVIDER ---
         doc.strokeColor(borderGray)
            .lineWidth(1)
            .moveTo(40, 128)
            .lineTo(555, 128)
            .stroke();


         // --- MIDDLE DETAILS AREA (Y: 140 to 230) ---

         // 1. BILL TO (X: 40 to 220)
         const billY = 140;
         doc.fillColor(primaryIndigo)
            .fontSize(9)
            .font('Helvetica-Bold')
            .text('BILL TO', 40, billY);

         doc.fillColor(brandDark)
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(companyName, 40, billY + 14);

         // Address blocks mapped dynamically to avoid ugly fixed whitespace overlaps
         doc.fillColor(brandMuted)
            .fontSize(8)
            .font('Helvetica');

         let dynamicY = billY + 27;
         doc.text(billingAddress, 40, dynamicY, { width: 175, lineGap: 2 });

         const calculatedAddressHeight = doc.heightOfString(billingAddress, { width: 175, lineGap: 2 });
         dynamicY += Math.max(25, calculatedAddressHeight + 6); // Beautiful flow spacer

         doc.text(`GSTIN: ${gstin}`, 40, dynamicY)
            .text(`Email: ${billingEmail}`)
            .text(`Phone: ${data.phone || '+91 98765 43210'}`);

         // 2. PLAN DETAILS CARD (CENTER BOX, X: 235 to 395)
         doc.roundedRect(235, billY, 160, 85, 8)
            .fillColor(bgSlate)
            .fillAndStroke(borderGray, bgSlate);

         // Miniature icon inside card
         doc.roundedRect(247, billY + 15, 20, 20, 4)
            .fillColor('#e0e7ff')
            .fillAndStroke('#c7d2fe', '#e0e7ff');

         // Draw tiny cube inside mini-icon
         doc.fillColor(primaryIndigo)
            .rect(253, billY + 21, 8, 8)
            .fill();

         doc.fillColor(brandLight)
            .fontSize(7)
            .font('Helvetica-Bold')
            .text('Plan Details', 276, billY + 14);

         doc.fillColor(brandDark)
            .fontSize(8.5)
            .font('Helvetica-Bold')
            .text(`${planName} - Monthly`, 276, billY + 24);

         doc.fillColor(brandMuted)
            .fontSize(7.5)
            .font('Helvetica')
            .text(`Plan Start Date: ${new Date(issuedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, 276, billY + 42)
            .text(`Plan End Date: ${new Date(expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, 276, billY + 54);

         // 3. RIGHT COL STAMP STAMP & PAYMENT (X: 405 to 555)
         // A. "Paid Stamp Stamp Card" (Y: 140 to 175)
         doc.roundedRect(405, billY, 150, 35, 6)
            .fillColor(bgGreen)
            .fillAndStroke('#bbf7d0', bgGreen);

         // Little Green Tick Circle
         doc.fillColor(textGreen)
            .circle(417, billY + 17, 5)
            .fill();
         doc.fillColor('#ffffff')
            .fontSize(6)
            .font('Helvetica-Bold')
            .text('✔', 414.5, billY + 14.5);

         doc.fillColor(textGreen)
            .fontSize(8)
            .font('Helvetica-Bold')
            .text('Paid', 427, billY + 10);
         doc.fillColor(brandMuted)
            .fontSize(6.5)
            .font('Helvetica')
            .text('Thank you! Your payment has been received.', 427, billY + 19);

         // B. "Payment Details Card" (Y: 182 to 254)
         doc.roundedRect(405, billY + 42, 150, 75, 6)
            .fillColor(bgSlate)
            .fillAndStroke(borderGray, bgSlate);

         doc.fillColor(primaryIndigo)
            .fontSize(7.5)
            .font('Helvetica-Bold')
            .text('Payment Details', 413, billY + 48);

         doc.fillColor(brandLight)
            .fontSize(6.5)
            .font('Helvetica')
            .text('Transaction ID', 413, billY + 60)
            .text('Payment Method', 413, billY + 70)
            .text('Payment Date', 413, billY + 80)
            .text('Amount Paid', 413, billY + 92);

         // Aligned columns values inside Payment Card
         doc.fillColor(brandDark)
            .fontSize(6.5)
            .font('Helvetica-Bold')
            .text(transactionId, 470, billY + 60, { width: 80, align: 'right' })
            .text(paymentMethod, 470, billY + 70, { align: 'right', width: 80 })
            .text(new Date(issuedDate).toLocaleDateString('en-GB') + ' ' + new Date(issuedDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), 470, billY + 80, { align: 'right', width: 80 })
            .fontSize(7.5)
            .text(`INR ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 470, billY + 92, { align: 'right', width: 80 });


         // --- TABLE OF ITEMS (Y: 260 onwards) ---
         const tableY = 260;

         // Table Header row filled rectangle
         doc.roundedRect(40, tableY, 515, 18, 3)
            .fillColor(primaryIndigo)
            .fill();

         doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold');
         doc.text('#', 48, tableY + 5);
         doc.text('Item & Description', 70, tableY + 5);
         doc.text('HSN/SAC', 330, tableY + 5, { align: 'center', width: 50 });
         doc.text('Qty', 390, tableY + 5, { align: 'center', width: 25 });
         doc.text('Unit Price', 425, tableY + 5, { align: 'right', width: 60 });
         doc.text('Amount', 495, tableY + 5, { align: 'right', width: 55 });

         // Table Row Cells Content
         const rowY = tableY + 18;

         // Outer border rectangle for the row
         doc.strokeColor(borderGray)
            .lineWidth(1)
            .rect(40, rowY, 515, 36)
            .stroke();

         // Divider columns vertical lines
         doc.strokeColor(borderGray)
            .lineWidth(0.5)
            .moveTo(63, rowY).lineTo(63, rowY + 36)
            .moveTo(325, rowY).lineTo(325, rowY + 36)
            .moveTo(385, rowY).lineTo(385, rowY + 36)
            .moveTo(420, rowY).lineTo(420, rowY + 36)
            .moveTo(490, rowY).lineTo(490, rowY + 36)
            .stroke();

         // Cell Data - Using INR instead of Indian Rupee symbol to prevent box-character rendering bugs in PDFKit
         doc.fillColor(brandDark).fontSize(8).font('Helvetica');
         doc.text('1', 48, rowY + 14);

         // Item Name and Desc bold/regular
         doc.font('Helvetica-Bold')
            .text(`${planName} - Monthly Subscription`, 70, rowY + 9);
         doc.fillColor(brandLight)
            .font('Helvetica')
            .fontSize(6.5)
            .text('Includes active Job Posts, Applicant Tracking System, premium Resume downloads, dedicated hiring workflows', 70, rowY + 20, { width: 250 });

         doc.fillColor(brandDark)
            .fontSize(8)
            .text('998313', 325, rowY + 14, { align: 'center', width: 60 });

         doc.text('1', 385, rowY + 14, { align: 'center', width: 35 });

         doc.text(`INR ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 420, rowY + 14, { align: 'right', width: 65 });

         doc.font('Helvetica-Bold')
            .text(`INR ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 490, rowY + 14, { align: 'right', width: 60 });


         // --- FINANCIAL CALCULATION BREAKDOWN AREA (Y: calcY) ---
         const calcY = rowY + 48;

         // 1. Amount In Words (Left Column, X: 40 to 300)
         doc.fillColor(primaryIndigo)
            .fontSize(8)
            .font('Helvetica-Bold')
            .text('Amount in Words', 40, calcY);

         const amountWords = numberToWords(totalAmount);
         doc.fillColor(brandDark)
            .fontSize(8)
            .font('Helvetica')
            .text(amountWords, 40, calcY + 12, { width: 250, lineGap: 3 });

         // 2. Financial Breakdown Rows (Right Column, X: 330 to 555)
         const labelX = 330;
         const valX = 475;

         doc.fillColor(brandMuted).fontSize(8).font('Helvetica');

         doc.text('Sub Total', labelX, calcY);
         doc.font('Helvetica-Bold').fillColor(brandDark).text(`INR ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valX, calcY, { align: 'right', width: 75 });

         doc.fillColor(brandMuted).font('Helvetica').text('CGST (9%)', labelX, calcY + 12);
         doc.font('Helvetica-Bold').fillColor(brandDark).text(`INR ${(gstAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valX, calcY + 12, { align: 'right', width: 75 });

         doc.fillColor(brandMuted).font('Helvetica').text('SGST (9%)', labelX, calcY + 24);
         doc.font('Helvetica-Bold').fillColor(brandDark).text(`INR ${(gstAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valX, calcY + 24, { align: 'right', width: 75 });

         doc.fillColor(brandMuted).font('Helvetica').text('Total Tax', labelX, calcY + 36);
         doc.font('Helvetica-Bold').fillColor(brandDark).text(`INR ${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valX, calcY + 36, { align: 'right', width: 75 });

         // Total Grand Amount filled light-purple row box
         doc.roundedRect(325, calcY + 50, 230, 20, 4)
            .fillColor('#e0e7ff')
            .fillAndStroke('#c7d2fe', '#e0e7ff');

         doc.fillColor(primaryIndigo)
            .fontSize(9)
            .font('Helvetica-Bold')
            .text('Total Amount', labelX, calcY + 56);

         doc.text(`INR ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valX, calcY + 56, { align: 'right', width: 75 });


         // --- BOTTOM SECTION BANK DETAILS & FOOTER (Y: bankY) ---
         const bankY = calcY + 82;

         // 1. Bank Details Card (Left Side, Y: bankY)
         doc.roundedRect(40, bankY, 260, 56, 6)
            .fillColor(bgSlate)
            .fillAndStroke(borderGray, bgSlate);

         doc.fillColor(primaryIndigo)
            .fontSize(8)
            .font('Helvetica-Bold')
            .text('Bank Details', 48, bankY + 8);

         doc.fillColor(brandDark)
            .fontSize(7)
            .font('Helvetica-Bold')
            .text('ITjobx Technologies Pvt. Ltd.', 48, bankY + 20)
            .font('Helvetica')
            .fillColor(brandMuted)
            .text('HDFC Bank   |   A/C No: 50200012345678', 48, bankY + 30)
            .text('IFSC Code: HDFC0001234   |   Branch: Noida Sector 63', 48, bankY + 40);

         // 2. Handwritten "Thank You" Style signature (Right Side, X: 340 to 555)
         doc.fillColor(primaryIndigo)
            .fontSize(14)
            .font('Times-BoldItalic')
            .text('Thank You!', 400, bankY + 12, { align: 'center', width: 140 });

         doc.fillColor(brandLight)
            .fontSize(7.5)
            .font('Helvetica')
            .text('For choosing ITjobx', 400, bankY + 28, { align: 'center', width: 140 });


         // --- TERMS & FOOTER DIVIDER ---
         const footY = bankY + 68;

         doc.strokeColor(borderGray)
            .lineWidth(1)
            .moveTo(40, footY)
            .lineTo(555, footY)
            .stroke();

         doc.fillColor(brandLight)
            .fontSize(7)
            .font('Helvetica-Bold')
            .text('Notes', 40, footY + 10);

         doc.font('Helvetica')
            .fillColor(brandLight)
            .text('• This is a computer generated invoice and does not require a physical signature.', 40, footY + 20)
            .text('• For any queries, contact us at billing@ITjobx.co', 40, footY + 28);

         // Copyright Line Centered at bottom (slightly shifted up to prevent pagebreak triggers)
         doc.fillColor(brandLight)
            .fontSize(7)
            .text('© 2026 ITjobx Technologies Pvt. Ltd. All rights reserved.', 40, 770, { align: 'center', width: 515 });

         // End PDF compiler stream
         doc.end();

         stream.on('finish', () => {
            resolve(filePath);
         });

         stream.on('error', (err) => {
            reject(err);
         });

      } catch (error) {
         reject(error);
      }
   });
};

module.exports = { generateInvoicePDF };
