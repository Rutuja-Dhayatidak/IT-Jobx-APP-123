const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Lead = require("../src/models/Lead");

const checkDetails = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    
    const lead = await Lead.findOne({ email: "worknaiintern10@gmail.com" });
    if (lead) {
      console.log("\n================ LEAD DOCUMENT DETAILS IN 'leads' COLLECTION ================");
      console.log("ID:", lead._id);
      console.log("Company:", lead.company || lead.companyName);
      console.log("Email:", lead.email || lead.workEmail);
      console.log("Status:", lead.status);
      console.log("Notes:", lead.notes);
      console.log("Demo Date:", lead.demoDate);
      console.log("Demo Time:", lead.demoTime);
      console.log("Meet Link:", lead.meetLink);
      console.log("\nActivities Log:");
      lead.activities.forEach((act, idx) => {
        console.log(`  - [${new Date(act.time).toLocaleString()}] ${act.text}`);
      });
      console.log("============================================================================");
    } else {
      console.log("No lead found in 'leads' collection with email 'worknaiintern10@gmail.com'");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
};

checkDetails();
