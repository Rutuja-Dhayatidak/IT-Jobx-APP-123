const Lead = require("../models/Lead");
const Candidate = require("../models/Candidate");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");
const PDFDocument = require("pdfkit");

/**
 * 📄 Helper: Generate Professional Master Legal Package (MSA + DPA + SLA + NDA)
 */
const generateContractPDF = (lead) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // --- STYLISH HEADER ---
        doc.rect(0, 0, 595.28, 80).fill('#0f172a');
        doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('MASTER LEGAL PACKAGE', 50, 25);
        doc.fontSize(10).font('Helvetica').text(`DATED: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, 50, 52);
        doc.text(`ITjobx (WORKNAI)  ×  ${(lead.company || 'PARTNER').toUpperCase()}`, 50, 65);

        doc.moveDown(4);

        // --- SECTION 1: MSA ---
        doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('1. MASTER SERVICE AGREEMENT (MSA)');
        doc.fillColor('#475569').fontSize(10).font('Helvetica').text('This Master Service Agreement ("Agreement") is entered into to govern the software-as-a-service relationship. ITjobx agrees to provide enterprise-grade recruitment automation tools, ATS integration, and candidate sourcing capabilities as specified in the accepted proposal.', { align: 'justify' });
        doc.moveDown();

        // --- SECTION 2: DPA ---
        doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('2. DATA PROCESSING ADDENDUM (DPA)');
        doc.fillColor('#475569').fontSize(10).font('Helvetica').text('Both parties agree to comply with applicable data protection laws (GDPR, DPDP). ITjobx shall act as a Data Processor for the employee and candidate data uploaded by the Client. We maintain ISO-certified security protocols and data encryption at rest.', { align: 'justify' });
        doc.moveDown();

        // --- SECTION 3: SLA ---
        doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('3. SERVICE LEVEL AGREEMENT (SLA)');
        doc.fillColor('#475569').fontSize(10).font('Helvetica').text('ITjobx guarantees 99.9% platform uptime. Enterprise clients receive "Priority 1" support with a maximum response time of 2 hours for critical issues. Maintenance windows will be communicated 48 hours in advance.', { align: 'justify' });
        doc.moveDown();

        // --- SECTION 4: NDA ---
        doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('4. NON-DISCLOSURE AGREEMENT (NDA)');
        doc.fillColor('#475569').fontSize(10).font('Helvetica').text('All trade secrets, candidate databases, and pricing terms are strictly confidential. Neither party shall disclose proprietary information to third parties without express written consent. This obligation survives termination for 5 years.', { align: 'justify' });

        // --- SIGNATURE BLOCK ---
        doc.moveDown(5);
        const sigY = doc.y;

        doc.path(`M 50 ${sigY} L 240 ${sigY}`).lineWidth(1).stroke('#cbd5e1');
        doc.fillColor('#64748b').fontSize(9).text('AUTHORIZED SIGNATORY (CLIENT)', 50, sigY + 8);
        doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text(lead.hrName || 'REPRESENTATIVE', 50, sigY + 22);

        doc.path(`M 320 ${sigY} L 510 ${sigY}`).lineWidth(1).stroke('#cbd5e1');
        doc.fillColor('#64748b').fontSize(9).text('AUTHORIZED SIGNATORY (ITjobx)', 320, sigY + 8);
        doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text('GAURAV - SALES DIRECTOR', 320, sigY + 22);

        // --- FOOTER ---
        doc.fontSize(8).fillColor('#94a3b8').text('This is a legally binding template package generated automatically upon digital acceptance of the business proposal.', 50, 780, { align: 'center', width: 495 });

        doc.end();
    });
};

// 🟢 ACCEPT PROPOSAL
exports.acceptProposal = async (req, res) => {
    try {
        const { token } = req.params;
        const lead = await Lead.findOne({
            proposalToken: token,
            proposalTokenExpires: { $gt: new Date() }
        });

        if (!lead) {
            return res.status(404).send("<h1>Proposal Expired or Invalid</h1><p>Please contact your sales representative.</p>");
        }

        if (lead.proposalAccepted) {
            return res.status(400).send("<h1>Action already taken</h1><p>You have already responded to this proposal.</p>");
        }

        // 1. Update Lead Status
        lead.status = "contract_pending";
        lead.proposalAccepted = true;
        lead.proposalAcceptedAt = new Date();
        lead.proposalToken = null; // Invalidate token after use

        lead.activities.push({
            text: "✅ Proposal accepted by company via email link",
            time: new Date()
        });
        lead.activities.push({
            text: "⏳ Waiting for Sales Rep to generate Master Legal Package",
            time: new Date()
        });

        await lead.save();

        // 📄 2. Notify Sales Person only (Client won't get automatic PDF now)
        const salesRep = await Candidate.findById(lead.salesRep);
        if (salesRep) {
            const salesSubject = `🎉 ${lead.company} accepted the proposal!`;
            const salesHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px;">
                    <div style="font-size: 24px; margin-bottom: 15px;">💰 Deal Alert!</div>
                    <p style="font-size: 16px;"><strong>${lead.company}</strong> has just accepted your enterprise proposal.</p>
                    <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p style="margin: 5px 0;"><strong>Value:</strong> ₹${lead.value?.toLocaleString()}</p>
                        <p style="margin: 5px 0;"><strong>Status:</strong> Contract Pending (Action Required)</p>
                    </div>
                    <p style="color: #64748b; font-size: 14px;"><strong>Next Step:</strong> Go to the Sales Panel and use the "Generate Legal Contract" button to dispatch the customized MSA/NDA package.</p>
                </div>
            `;
            await sendEmail(salesRep.email, salesSubject, "", salesHtml);

            // 🔔 3. Create In-App Notification
            await Notification.create({
                recipient: salesRep._id,
                title: "Deal Accepted! 🎉",
                message: `${lead.company} has accepted the enterprise proposal for ₹${lead.value?.toLocaleString()}.`,
                type: "proposal_accepted",
                relatedId: lead._id
            });
        }

        // Redirect to success page on frontend
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        res.redirect(`${frontendUrl}/proposal/accepted?company=${encodeURIComponent(lead.company)}`);

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

// 🟡 REQUEST CHANGES FORM (GET)
exports.getChangeRequestForm = async (req, res) => {
    try {
        const { token } = req.params;
        const lead = await Lead.findOne({
            proposalToken: token,
            proposalTokenExpires: { $gt: new Date() }
        });

        if (!lead) {
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
            return res.redirect(`${frontendUrl}/proposal/expired`);
        }

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        res.redirect(`${frontendUrl}/proposal/request-changes/${token}`);
    } catch (err) {
        res.status(500).send("Error");
    }
};

// 🟡 SUBMIT CHANGES (POST)
exports.submitChangeRequest = async (req, res) => {
    try {
        const { token } = req.params;
        const { change_types, details, best_time_to_call } = req.body;

        const lead = await Lead.findOne({
            proposalToken: token,
            proposalTokenExpires: { $gt: new Date() }
        });

        if (!lead) return res.status(404).json({ success: false, message: "Invalid or expired token" });

        lead.status = "negotiating";
        lead.changeRequested = true;
        lead.changeTypes = change_types;
        lead.changeDetails = details;
        lead.changeRequestedAt = new Date();
        lead.proposalVersion += 1;

        lead.activities.push({
            text: "⚠️ Change request submitted by company",
            time: new Date()
        });

        await lead.save();

        // Notify Sales
        const salesRep = await Candidate.findById(lead.salesRep);
        if (salesRep) {
            const salesSubject = `⚠️ ${lead.company} requested changes`;
            const salesHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                    <h2 style="color: #d97706;">Negotiation Started</h2>
                    <p><strong>Company:</strong> ${lead.company}</p>
                    <p><strong>Changes requested:</strong> ${change_types.join(", ")}</p>
                    <p><strong>Details:</strong> ${details}</p>
                    <p><strong>Best time to call:</strong> ${best_time_to_call}</p>
                </div>
            `;
            await sendEmail(salesRep.email, salesSubject, "", salesHtml);

            // 🔔 Create In-App Notification
            await Notification.create({
                recipient: salesRep._id,
                title: "Change Requested ⚠️",
                message: `${lead.company} requested changes to the proposal.`,
                type: "change_request",
                relatedId: lead._id
            });
        }

        res.json({ success: true, message: "Request received" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 🔴 REJECT PROPOSAL (GET)
exports.getRejectConfirmation = async (req, res) => {
    try {
        const { token } = req.params;
        const lead = await Lead.findOne({ proposalToken: token });
        if (!lead) {
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
            return res.redirect(`${frontendUrl}/proposal/expired`);
        }
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        res.redirect(`${frontendUrl}/proposal/reject/${token}`);
    } catch (err) {
        res.status(500).send("Error");
    }
};

// 🔴 CONFIRM REJECTION (POST)
exports.confirmRejection = async (req, res) => {
    try {
        const { token } = req.params;
        const { reason, details } = req.body;

        const lead = await Lead.findOne({ proposalToken: token });
        if (!lead) return res.status(404).json({ success: false, message: "Invalid token" });

        lead.status = "lost";
        lead.lostReason = reason;
        lead.lostAt = new Date();
        lead.proposalToken = null;

        lead.activities.push({
            text: `❌ Proposal rejected. Reason: ${reason}`,
            time: new Date()
        });

        await lead.save();

        // Polite email to company
        const companyEmail = lead.workEmail || lead.email;
        const companyHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                <p>Thank you for considering ITjobx. We understand it may not be the right time. We'll be here when you're ready.</p>
            </div>
        `;
        await sendEmail(companyEmail, "Thank you for your response", "", companyHtml);

        // Notify Sales
        const salesRep = await Candidate.findById(lead.salesRep);
        if (salesRep) {
            await sendEmail(salesRep.email, `${lead.company} rejected proposal`, `Reason: ${reason}\nDetails: ${details}`);

            // 🔔 Create In-App Notification
            await Notification.create({
                recipient: salesRep._id,
                title: "Proposal Rejected ❌",
                message: `${lead.company} rejected the proposal. Reason: ${reason}`,
                type: "proposal_rejected",
                relatedId: lead._id
            });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 👁️ TRACKING
exports.trackProposal = async (req, res) => {
    try {
        const { token } = req.params;
        const lead = await Lead.findOne({ proposalToken: token });

        if (lead && !lead.isProposalOpened) {
            lead.isProposalOpened = true;
            lead.proposalOpenedAt = new Date();
            lead.activities.push({
                text: "👀 Proposal email opened by company",
                time: new Date()
            });
            await lead.save();

            // Notify Sales
            const salesRep = await Candidate.findById(lead.salesRep);
            if (salesRep) {
                await sendEmail(salesRep.email, `👀 ${lead.company} opened proposal email!`, "Lead is currently reviewing the proposal.");
            }
        }

        // Return 1x1 transparent pixel
        const pixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
        res.set({ "Content-Type": "image/png", "Content-Length": pixel.length });
        res.send(pixel);
    } catch (err) {
        res.status(500).end();
    }
};
