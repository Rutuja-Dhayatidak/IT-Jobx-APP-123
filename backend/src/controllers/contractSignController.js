const Lead = require("../models/Lead");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary");
const generateSignaturePagePDF = require("../utils/embedSignatureInPDF");
const mergePDFs = require("../utils/mergePDFs");
const sendEmail = require("../utils/sendEmail");

/**
 * Verify Signing Token
 */
const verifySignToken = async (req, res) => {
    try {
        const { token } = req.params;

        const lead = await Lead.findOne({
            sign_token: token,
            sign_token_expires: { $gt: Date.now() }
        });

        if (!lead) {
            return res.status(404).json({
                success: false,
                valid: false,
                reason: "expired",
                message: "Signing link is invalid or has expired."
            });
        }

        if (lead.contract_signed) {
            return res.status(400).json({
                success: false,
                valid: false,
                reason: "already_signed",
                message: "This contract has already been signed."
            });
        }

        return res.json({
            success: true,
            valid: true,
            data: {
                company_name: lead.companyName || lead.company,
                contract_ref: lead.contract_ref,
                period_start: lead.contract_details?.period_start,
                period_end: lead.contract_details?.period_end,
                total_value: lead.contract_details?.total_amount,
                signer_name: lead.hrName || lead.name,
                signer_email: lead.workEmail || lead.email
            }
        });

    } catch (error) {
        console.error("Verify Token Error:", error);
        res.status(500).json({ success: false, message: "Server error during verification" });
    }
};

/**
 * Handle Contract Signing
 */
const signContract = async (req, res) => {
    try {
        const {
            token,
            signature_image,
            signer_name,
            signer_designation
        } = req.body;

        // 1. Verify Token and Lead
        const lead = await Lead.findOne({
            sign_token: token,
            sign_token_expires: { $gt: Date.now() }
        });

        if (!lead) {
            return res.status(404).json({ success: false, message: "Invalid or expired token" });
        }

        if (lead.contract_signed) {
            return res.status(400).json({ success: false, message: "Contract already signed" });
        }

        // 2. Upload Signature Image to Cloudinary
        console.log("Step 2: Uploading signature image to Cloudinary...");
        const sigUpload = await cloudinary.uploader.upload(signature_image, {
            folder: "ITjobx/signatures",
            resource_type: "image"
        });

        // 3. Generate Signature Certificate Page
        console.log("Step 3: Generating signature certificate page with Puppeteer...");
        const signaturePageBuffer = await generateSignaturePagePDF({
            contract_ref: lead.contract_ref || 'Enterprise',
            signer_name,
            signer_designation,
            company_name: lead.companyName || lead.company,
            signed_at: new Date(),
            ip_address: req.ip || req.headers['x-forwarded-for'] || 'Unknown',
            signature_image_url: signature_image // Use base64 directly for Puppeteer reliability
        });

        // 4. Merge with Original PDF
        console.log("Step 4: Merging PDFs...");
        if (!lead.contract_pdf_url) {
            throw new Error("Original contract PDF URL is missing from lead record");
        }
        const mergedPdfBuffer = await mergePDFs(lead.contract_pdf_url, signaturePageBuffer, signature_image);

        // 5. Upload Signed PDF to Cloudinary
        console.log("Step 5: Uploading merged signed PDF to Cloudinary...");
        const pdfPublicId = `signed_${(lead.contract_ref || 'DOC').replace(/\//g, '-')}_${Date.now()}`;

        const pdfUpload = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "ITjobx/contracts/signed",
                    resource_type: "raw",
                    public_id: pdfPublicId,
                    access_mode: 'public',
                    invalidate: true
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(mergedPdfBuffer);
        });

        // 6. Update Lead in Database
        console.log("Step 6: Updating lead in database...");
        lead.contract_signed = true;
        lead.signed_at = new Date();
        lead.signed_by_client = signer_name;
        lead.signer_designation = signer_designation;
        lead.signature_image_url = sigUpload.secure_url;
        lead.signed_pdf_url = pdfUpload.secure_url;
        lead.sign_token = null; // Invalidate token
        lead.status = "contract_signed";
        lead.signature_audit = {
            ip_address: req.ip || req.headers['x-forwarded-for'] || 'Unknown',
            user_agent: req.headers['user-agent'],
            agreed_at: new Date(),
            device_type: req.headers['sec-ch-ua-platform'] || 'Desktop'
        };

        lead.activities.push({
            text: `✔ Contract ${lead.contract_ref || 'Enterprise'} digitally signed by ${signer_name} (${signer_designation})`,
            time: new Date()
        });

        await lead.save();
        console.log("Lead updated successfully.");

        // 7. Send Confirmation Email with Signed PDF
        console.log("Step 7: Sending confirmation email...");
        const targetEmail = lead.workEmail || lead.email;
        try {
            await sendEmail(
                targetEmail,
                `Signed Contract: ${lead.contract_ref || 'ITjobx'} — ITjobx Enterprise`,
                `Hi ${signer_name},\n\nThank you for signing the enterprise contract for ${lead.companyName || lead.company}. A copy of the fully signed document is attached for your records.\n\nOur team will contact you within 24 hours to proceed with platform activation.`,
                "",
                [
                    {
                        filename: `Signed_Contract_${(lead.contract_ref || 'ITjobx').replace(/\//g, '-')}.pdf`,
                        content: mergedPdfBuffer
                    }
                ]
            );
        } catch (emailErr) {
            console.error("Email sending failed but contract was signed:", emailErr);
            // Don't fail the whole request if only email fails
        }

        // 8. Notify Sales Rep
        console.log("Step 8: Notifying sales rep...");
        try {
            const populatedLead = await Lead.findById(lead._id).populate('salesRep');
            if (populatedLead && populatedLead.salesRep && populatedLead.salesRep.email) {
                await sendEmail(
                    populatedLead.salesRep.email,
                    `🔥 ACTION REQUIRED: Contract Signed by ${lead.companyName || lead.company}`,
                    `Great news! ${signer_name} has just signed the enterprise contract (${lead.contract_ref || 'ITjobx'}).\n\nNext Step: Generate the invoice and trigger platform activation.\n\nView details: ${process.env.FRONTEND_URL}/sales/leads`
                );

                // 🔔 Trigger In-App Notification
                await Notification.create({
                    recipient: populatedLead.salesRep._id,
                    title: "Contract Signed! 🔥",
                    message: `${lead.companyName || lead.company} has digitally signed the enterprise contract. Please generate the invoice.`,
                    type: "contract_signed",
                    relatedId: lead._id
                });
            }
        } catch (repErr) {
            console.error("Sales rep notification failed:", repErr);
        }

        console.log("Signing process completed successfully.");
        return res.json({
            success: true,
            message: "Contract signed successfully",
            signed_pdf_url: pdfUpload.secure_url
        });

    } catch (error) {
        console.error("CONTRACT SIGNING FATAL ERROR:", error.stack || error);
        res.status(500).json({
            success: false,
            message: "Failed to process signature",
            error: error.message,
            stack: error.stack // Added for debugging
        });
    }
};

module.exports = {
    verifySignToken,
    signContract
};
