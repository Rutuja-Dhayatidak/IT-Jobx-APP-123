const mongoose = require('mongoose');
require('dotenv').config({path: './.env'});

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Invoice = require('./src/models/Invoice');
    const Company = require('./src/models/Company');
    const EnterpriseLead = require('./src/models/EnterpriseLead');

    const invoices = await Invoice.find({ company_id: { $exists: false }, lead_id: { $exists: true } });
    console.log('Found invoices without company_id:', invoices.length);

    for (let inv of invoices) {
        const lead = await EnterpriseLead.findById(inv.lead_id);
        if (lead) {
            const comp = await Company.findOne({ email: lead.workEmail });
            if (comp) {
                inv.company_id = comp._id;
                inv.status = 'paid';
                await inv.save();
                console.log(`Updated invoice ${inv.invoiceNumber} for company ${comp.name}`);
            }
        }
    }
    console.log('Fixed existing invoices');
    process.exit(0);
}).catch(console.error);
