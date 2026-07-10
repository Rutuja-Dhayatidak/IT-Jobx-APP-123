const Lead = require("../models/Lead");
const generateContractPDF = require("../utils/generateContractPDF");
const sendEmail = require("../utils/sendEmail");
const { contractEmailHTML } = require("../templates/emails/contractEmail");

/**
 * Enterprise Contract Controller
 */
const generateContract = async (req, res) => {
    try {
        const { lead_id, provider, client, contract } = req.body;

        // 1. Validation
        if (!lead_id || !client.company_name || !contract.total_amount) {
            return res.status(400).json({
                success: false,
                message: "Lead ID, Company Name, and Total Amount are required."
            });
        }

        const lead = await Lead.findById(lead_id);
        if (!lead) {
            return res.status(404).json({ success: false, message: "Lead not found" });
        }

        // 3. Generate Reference Number if missing
        if (!contract.ref_number) {
            const count = await Lead.countDocuments({ status: { $in: ["contract_pending", "contract_signed"] } });
            const year = new Date().getFullYear();
            contract.ref_number = `NH-ENT-${year}-${String(count + 1).padStart(4, '0')}`;
        }

        // 3.5 Generate Signing Token
        const crypto = require('crypto');
        const signToken = crypto.randomBytes(32).toString('hex');
        const signTokenExpires = new Date();
        signTokenExpires.setDate(signTokenExpires.getDate() + 7); // Valid for 7 days

        // 4. Generate and Upload PDF
        const { pdf_url, filename, pdf_buffer } = await generateContractPDF({
            provider,
            client,
            contract
        });

        // 5. Update Lead in DB
        const updatedLead = await Lead.findByIdAndUpdate(
            lead_id,
            {
                $set: {
                    status: "contract_pending",
                    contract_pdf_url: pdf_url,
                    contract_ref: contract.ref_number,
                    contract_generated_at: new Date(),
                    contract_sent_at: new Date(),
                    sign_token: signToken,
                    sign_token_expires: signTokenExpires,
                    // [SYNC] Update main lead pricing fields to match contract
                    value: contract.base_amount,
                    discountPercent: contract.discount_percent || 0,
                    contract_details: {
                        base_amount: contract.base_amount,
                        discount_percent: contract.discount_percent || 0,
                        gst_amount: contract.gst_amount,
                        total_amount: contract.total_amount,
                        period_start: new Date(contract.period_start),
                        period_end: new Date(contract.period_end),
                        ref_number: contract.ref_number,
                        payment_terms: contract.payment_terms,
                        notice_period: contract.notice_period,
                        governing_law: contract.governing_law
                    }
                },
                $push: {
                    activities: {
                        text: `📄 Contract ${contract.ref_number} generated and emailed to ${client.company_name}`,
                        time: new Date()
                    }
                }
            },
            { new: true }
        );

        // 6. Send Email to Client
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const signUrl = `${frontendUrl}/contract/sign?token=${signToken}`;
        const targetEmail = client.email || lead.workEmail || lead.email;
        const emailContent = contractEmailHTML({ client, contract, pdf_url, sign_url: signUrl });

        console.log(`Attempting to send contract email to: ${targetEmail} | Sign URL: ${signUrl}`);

        await sendEmail(
            targetEmail,
            `Master Legal Package — ITjobx Enterprise · ${contract.ref_number}`,
            "",
            emailContent,
            [
                {
                    filename: filename,
                    content: pdf_buffer // Use direct buffer for reliability
                }
            ]
        );

        // 6. Notify Sales Person (User)
        if (req.user && req.user.email) {
            await sendEmail(
                req.user.email,
                `Contract Sent: ${client.company_name}`,
                `The contract ${contract.ref_number} for ${client.company_name} has been generated and emailed successfully.\n\nRecipient: ${targetEmail}\nPDF URL: ${pdf_url}`
            );
        }

        return res.json({
            success: true,
            message: `Contract generated and emailed to ${targetEmail}`,
            pdf_url,
            filename,
            ref_number: contract.ref_number,
            target_email: targetEmail,
            lead: updatedLead
        });

    } catch (error) {
        console.error("Contract Controller Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate or send contract",
            error: error.message
        });
    }
};

module.exports = {
    generateContract
};
