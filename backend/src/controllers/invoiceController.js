const Lead = require("../models/Lead");
const generateInvoicePDF = require("../utils/generateInvoicePDF");
const sendEmail = require("../utils/sendEmail");

/**
 * Handles Tax Invoice Generation for signed contracts
 */
exports.generateInvoice = async (req, res) => {
    try {
        const { leadId } = req.body;

        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        if (lead.status !== 'contract_signed') {
            return res.status(400).json({ message: "Invoice can only be generated for signed contracts" });
        }

        console.log(`Generating Tax Invoice for: ${lead.companyName || lead.company}`);

        // 1. Generate PDF and Upload to Cloudinary
        const invoiceData = await generateInvoicePDF({ lead });

        // 2. Update Lead Record
        const ref = lead.contract_ref || lead.contract_details?.ref_number || 'ENT-DOC';
        lead.invoice_url = invoiceData.url;
        lead.invoice_ref = `INV-${ref}`;
        lead.invoice_generated_at = new Date();
        lead.invoice_sent_at = new Date();
        lead.payment_status = 'not_generated';

        // Add activity
        lead.activities.push({
            text: `Tax Invoice generated and sent to client: ₹${invoiceData.totalAmount.toLocaleString('en-IN')}`,
            time: new Date()
        });

        await lead.save();

        // 3. Send Email to Client
        const emailContent = `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #1e3a8a; margin: 0;">ITjobx.</h1>
                    <p style="color: #64748b; font-size: 14px;">Enterprise Solutions</p>
                </div>
                
                <h2 style="color: #1e293b;">Tax Invoice: ${lead.companyName || lead.company}</h2>
                <p>Hello ${lead.hrName || lead.name},</p>
                
                <p>Following the digital signing of your Enterprise Contract (Ref: ${lead.contract_ref}), please find the attached Tax Invoice for the activation of your ITjobx services.</p>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <table style="width: 100%;">
                        <tr>
                            <td style="color: #64748b;">Invoice Reference:</td>
                            <td style="text-align: right; font-weight: bold;">${lead.invoice_ref}</td>
                        </tr>
                        <tr>
                            <td style="color: #64748b;">Total Amount Due:</td>
                            <td style="text-align: right; font-weight: bold; color: #1e3a8a; font-size: 18px;">₹${invoiceData.totalAmount.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td style="color: #64748b;">Payment Due By:</td>
                            <td style="text-align: right;">${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}</td>
                        </tr>
                    </table>
                </div>

                <p><strong>Payment Instructions (NEFT/IMPS):</strong></p>
                <div style="font-size: 14px; color: #475569; border-left: 4px solid #3b82f6; padding-left: 15px;">
                    Bank: HDFC Bank Ltd<br>
                    A/C Name: ITjobx Technologies Pvt Ltd<br>
                    A/C Number: 50200064829304<br>
                    IFSC: HDFC0001234
                </div>

                <p style="margin-top: 30px;">Once the transfer is complete, please share the transaction reference with your Sales Representative.</p>
                
                <p>Best Regards,<br><strong>ITjobx Finance Team</strong></p>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #94a3b8;">
                    ITjobx Technologies Pvt Ltd • HSR Layout, Bangalore
                </div>
            </div>
        `;

        await sendEmail(
            lead.workEmail || lead.email,
            `Tax Invoice - ITjobx Enterprise - ${lead.companyName || lead.company}`,
            "", // Plain text fallback
            emailContent,
            [
                {
                    filename: invoiceData.filename,
                    content: invoiceData.buffer
                }
            ]
        );

        res.status(200).json({
            message: "Invoice generated and sent successfully",
            invoice_url: invoiceData.url,
            total_amount: invoiceData.totalAmount
        });

    } catch (error) {
        console.error("Invoice Generation Error:", error);
        res.status(500).json({
            message: "Internal server error during invoice generation",
            error: error.message,
            stack: error.stack
        });
    }
};
