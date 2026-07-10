const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Lead = require("../src/models/Lead");
const EnterpriseLead = require("../src/models/EnterpriseLead");

const clearLeads = async () => {
  try {
    const uri = process.env.MONGO_URI;
    console.log("Connecting to URI:", uri ? uri.substring(0, 70) + "..." : "undefined");
    await mongoose.connect(uri);
    console.log("Connected successfully!");

    const leadDeleteResult = await Lead.deleteMany({});
    console.log(`Successfully deleted ${leadDeleteResult.deletedCount} documents from 'leads' collection.`);

    const enterpriseLeadDeleteResult = await EnterpriseLead.deleteMany({});
    console.log(`Successfully deleted ${enterpriseLeadDeleteResult.deletedCount} documents from 'enterpriseleads' collection.`);

    await mongoose.disconnect();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Error:", error);
  }
};

clearLeads();
