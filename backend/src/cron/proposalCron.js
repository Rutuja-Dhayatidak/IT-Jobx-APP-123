const cron = require("node-cron");
const Lead = require("../models/Lead");
const Candidate = require("../models/Candidate");
const sendEmail = require("../utils/sendEmail");

// Run every day at 10 AM
cron.schedule("0 10 * * *", async () => {
    console.log("🚀 Running Proposal Follow-up Cron Job...");

    try {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // 1. Proposals sent but NOT OPENED in 3 days
        const notOpenedLeads = await Lead.find({
            status: "proposal_sent",
            isProposalOpened: false,
            proposalSentAt: { $lte: threeDaysAgo, $gt: sevenDaysAgo }
        });

        for (const lead of notOpenedLeads) {
            const companyEmail = lead.workEmail || lead.email;
            await sendEmail(
                companyEmail,
                `Follow up: Enterprise Proposal for ${lead.company}`,
                "Just checking in to see if you received our proposal sent a few days ago."
            );
            lead.activities.push({ text: "⏰ Auto-follow up sent (Proposal not opened)", time: new Date() });
            await lead.save();
        }

        // 2. Proposals OPENED but NO RESPONSE in 3 days
        const openedNoResponseLeads = await Lead.find({
            status: "proposal_sent",
            isProposalOpened: true,
            proposalOpenedAt: { $lte: threeDaysAgo, $gt: sevenDaysAgo },
            proposalAccepted: false,
            changeRequested: false
        });

        for (const lead of openedNoResponseLeads) {
            const companyEmail = lead.workEmail || lead.email;
            await sendEmail(
                companyEmail,
                `Next Steps: ${lead.company} & ITjobx`,
                "We noticed you reviewed the proposal. Do you have any questions or would you like to schedule a quick call to discuss the next steps?"
            );
            lead.activities.push({ text: "⏰ Auto-follow up sent (Opened but no response)", time: new Date() });
            await lead.save();
        }

        // 3. Notify Sales Reps of proposals expiring in 48 hours
        const fortyEightHoursFromNow = new Date();
        fortyEightHoursFromNow.getHours(fortyEightHoursFromNow.getHours() + 48);

        const expiringLeads = await Lead.find({
            status: "proposal_sent",
            proposalTokenExpires: { $lte: fortyEightHoursFromNow, $gt: new Date() }
        });

        for (const lead of expiringLeads) {
            const salesRep = await Candidate.findById(lead.salesRep);
            if (salesRep) {
                await sendEmail(
                    salesRep.email,
                    `⚠️ Proposal Expiring Soon: ${lead.company}`,
                    `The proposal for ${lead.company} will expire in less than 48 hours. Please reach out to the client.`
                );
            }
        }

        console.log("✅ Proposal Cron Job Finished Successfully.");
    } catch (err) {
        console.error("❌ Proposal Cron Job Error:", err);
    }
});
