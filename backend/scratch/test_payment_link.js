require('dotenv').config();
const mongoose = require('mongoose');
const enterprisePaymentController = require('../src/controllers/enterprisePaymentController');
const Lead = require('../src/models/Lead');

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const lead = await Lead.findOne({ contract_signed: true });
        if (!lead) {
            console.log("No signed lead found to test with");
            return;
        }

        console.log("Testing with lead:", lead._id, lead.companyName);

        const req = {
            body: {
                lead_id: lead._id.toString(),
                base_amount: 800,
                gst_amount: 180,
                total_amount: 980,
                company_name: lead.companyName || lead.company,
                email: lead.workEmail || lead.email,
                phone: lead.phoneNumber || lead.phone,
                contract_ref: lead.contract_ref
            }
        };

        const res = {
            status: function(code) {
                console.log("Response status:", code);
                return this;
            },
            json: function(data) {
                console.log("Response JSON:", JSON.stringify(data, null, 2));
                return this;
            }
        };

        await enterprisePaymentController.createPaymentLink(req, res);

    } catch (err) {
        console.error("Test Script Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

test();
