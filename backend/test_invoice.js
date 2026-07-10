require('dotenv').config();
const mongoose = require('mongoose');
const Lead = require('./src/models/Lead');
const generateInvoicePDF = require('./src/utils/generateInvoicePDF');

async function testInvoice() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const lead = await Lead.findOne({ contract_pdf_url: { $exists: true, $ne: "" } }).sort({ updatedAt: -1 });
        if (!lead) {
            console.log("No lead found");
            return;
        }

        console.log(`Testing invoice for: ${lead.companyName || lead.company}`);
        const invoiceData = await generateInvoicePDF({ lead });
        console.log("Success! Invoice URL:", invoiceData.url);
        console.log("Total Amount:", invoiceData.totalAmount);

    } catch (err) {
        console.error("INVOICE TEST FAILED:", err);
    } finally {
        await mongoose.connection.close();
    }
}

testInvoice();
