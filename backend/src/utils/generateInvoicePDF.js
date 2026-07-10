const puppeteer = require('puppeteer');
const cloudinary = require('../config/cloudinary');

/**
 * Generates a professional Tax Invoice PDF using Puppeteer
 */
const generateInvoicePDF = async (data) => {
    const { lead } = data;
    if (!lead) throw new Error("Lead data is missing for PDF generation");

    // Calculate Financials (with overrides from controller if provided)
    const baseAmount = data.baseAmount !== undefined ? data.baseAmount : (lead.value || 0);
    const discountPct = data.discountPct !== undefined ? data.discountPct : (lead.discountPercent || 0);
    const discountAmount = (baseAmount * discountPct) / 100;
    const afterDiscount = baseAmount - discountAmount;
    const gstRate = 0.18;
    const gstAmount = afterDiscount * gstRate;
    const totalAmount = afterDiscount + gstAmount;

    const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page { size: A4; margin: 0; }
            body { font-family: 'Inter', 'Helvetica', sans-serif; color: #1e293b; margin: 0; padding: 50px; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .company-info h1 { margin: 0; color: #1e3a8a; font-size: 32px; font-weight: 800; letter-spacing: -1.5px; }
            .company-info p { margin: 3px 0; font-size: 11px; color: #64748b; }
            .invoice-label { text-align: right; }
            .invoice-label h2 { margin: 0; color: #3b82f6; font-size: 36px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
            .invoice-label p { margin: 5px 0; font-weight: 600; font-size: 14px; }
            
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-bottom: 40px; }
            .bill-to h3 { font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px; font-weight: 700; }
            .bill-to p { margin: 4px 0; font-size: 14px; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { background-color: #f8fafc; text-align: left; padding: 15px 12px; font-size: 11px; text-transform: uppercase; color: #2563eb; border-bottom: 2px solid #e2e8f0; font-weight: 700; }
            td { padding: 20px 12px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
            .text-right { text-align: right; }
            
            .totals-container { margin-top: 20px; }
            .totals { background: #f1f8f1; padding: 25px; border-radius: 12px; border: 1px solid #dcfce7; width: 320px; margin-left: auto; }
            .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
            
            .bank-details { background: #f0f9ff; padding: 25px; border-radius: 12px; border: 1px solid #bae6fd; margin-top: 50px; }
            .bank-details h4 { margin: 0 0 15px 0; color: #2563eb; font-size: 12px; text-transform: uppercase; font-weight: 800; }
            .bank-details p { margin: 6px 0; font-size: 13px; }
            
            .footer { margin-top: 80px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 30px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-info">
                <h1>ITjobx.</h1>
                <p>ITjobx Technologies Pvt Ltd</p>
                <p>M-12, Business Bay, HSR Layout, Sector 6</p>
                <p>Bangalore, Karnataka - 560102</p>
                <p>GSTIN: 29AAACN8483L1Z3</p>
            </div>
            <div class="invoice-label">
                <h2>TAX INVOICE</h2>
                <p>Invoice #: INV-${lead.contract_ref || 'DOC'}</p>
                <p>Date: ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
        </div>

        <div class="details-grid">
            <div class="bill-to">
                <h3>Bill To</h3>
                <p><strong>${lead.companyName || lead.company}</strong></p>
                <p>${lead.companyLocation || 'Client Address'}</p>
                <p>Contact: ${lead.hrName || lead.name}</p>
                <p>Email: ${lead.workEmail || lead.email}</p>
            </div>
            <div class="bill-to">
                <h3>Reference</h3>
                <p>Contract Ref: ${lead.contract_ref}</p>
                <p>Due Date: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}</p>
                <p>Status: Unpaid (NEFT Only)</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Quantity</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong>ITjobx Enterprise License Fee</strong><br>
                        <small style="color:#64748b">AI-Powered Recruitment Suite (MSA Reference: ${lead.contract_ref})</small>
                    </td>
                    <td class="text-right">₹${baseAmount.toLocaleString('en-IN')}</td>
                    <td class="text-right">1</td>
                    <td class="text-right">₹${baseAmount.toLocaleString('en-IN')}</td>
                </tr>
            </tbody>
        </table>

        <div class="totals" style="background: #f1f8f1; padding: 20px; border-radius: 8px; border: 1px solid #dcfce7; width: 300px; margin-left: auto;">
            <div class="total-row" style="color: #166534; font-size: 10px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase;">
                Investment Summary
            </div>
            <div class="total-row" style="color: #334155;">
                <span>Base Amount</span>
                <span>₹${baseAmount.toLocaleString('en-IN')}</span>
            </div>
            ${discountPct > 0 ? `
            <div class="total-row" style="color: #b91c1c;">
                <span>Discount (${discountPct}%)</span>
                <span>- ₹${discountAmount.toLocaleString('en-IN')}</span>
            </div>
            <div class="total-row" style="color: #334155; font-weight: 600; border-top: 1px solid #d1d5db; margin-top: 5px; padding-top: 5px;">
                <span>After Discount</span>
                <span>₹${afterDiscount.toLocaleString('en-IN')}</span>
            </div>
            ` : ''}
            <div class="total-row" style="color: #334155; margin-top: ${discountPct > 0 ? '5px' : '0'};">
                <span>GST (18%)</span>
                <span>₹${gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div class="total-row" style="border-top: 2px solid #166534; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 16px; color: #166534;">
                <span>Total Payable</span>
                <span>₹${totalAmount.toLocaleString('en-IN')}</span>
            </div>
        </div>

        <div class="bank-details">
            <h4>Bank Payment Details (NEFT/IMPS)</h4>
            <p><strong>Account Name:</strong> ITjobx Technologies Pvt Ltd</p>
            <p><strong>Bank Name:</strong> HDFC Bank Ltd</p>
            <p><strong>Account Number:</strong> 50200064829304</p>
            <p><strong>IFSC Code:</strong> HDFC0001234</p>
            <p><strong>Branch:</strong> HSR Layout, Sector 6, Bangalore</p>
        </div>

        <div class="footer">
            <p>This is a computer-generated tax invoice. No signature is required.</p>
            <p>Please make payment within 7 days. Late payments may attract interest as per the MSA.</p>
            <p>© 2026 ITjobx Technologies Pvt Ltd. All rights reserved.</p>
        </div>
    </body>
    </html>`;

    let browser;
    try {
        console.log("Launching Puppeteer for Invoice...");
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
            headless: 'new'
        });
        const page = await browser.newPage();
        console.log("Setting Invoice HTML...");
        await page.setContent(invoiceHTML, { waitUntil: 'networkidle0', timeout: 30000 });
        console.log("Generating PDF Buffer...");
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        // Upload to Cloudinary
        const contractRefClean = (lead.contract_ref || 'ENT-DOC').toString().replace(/\//g, '-');
        const filename = `Invoice-${contractRefClean}-${Date.now()}`;

        console.log(`Uploading Invoice PDF to Cloudinary: ${filename}`);

        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "ITjobx/invoices",
                    resource_type: "raw",
                    public_id: filename,
                    access_mode: 'public'
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Upload Error:", error);
                        reject(error);
                    }
                    else resolve(result);
                }
            );
            stream.end(pdfBuffer);
        });

        return {
            url: uploadResult.secure_url,
            buffer: pdfBuffer,
            filename: `${filename}.pdf`,
            totalAmount
        };

    } catch (err) {
        console.error("PDF GENERATION FAILED AT STEP:", err);
        if (browser) await browser.close();
        throw err;
    }
};

module.exports = generateInvoicePDF;
