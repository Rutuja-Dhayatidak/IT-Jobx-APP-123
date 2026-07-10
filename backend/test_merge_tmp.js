const mongoose = require('mongoose');
const Lead = require('./src/models/Lead');
const mergePDFs = require('./src/utils/mergePDFs');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config({ path: './.env' });

async function testMerge() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const lead = await Lead.findOne({ contract_pdf_url: { $exists: true, $ne: "" } }).sort({ updatedAt: -1 });
        if (!lead || !lead.contract_pdf_url) {
            console.log("No pending contract with PDF URL found");
            return;
        }

        console.log("Testing merge for Lead:", lead.companyName || lead.company);
        console.log("URL:", lead.contract_pdf_url);

        // Dummy signature page (1x1 red dot PDF buffer)
        const dummyPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF');

        const merged = await mergePDFs(lead.contract_pdf_url, dummyPdf, "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==");
        console.log("Success! Merged PDF size:", merged.length);
        fs.writeFileSync('test_merged.pdf', merged);
        console.log("Saved to test_merged.pdf");

    } catch (err) {
        console.error("TEST FAILED:", err);
    } finally {
        await mongoose.disconnect();
    }
}

testMerge();
