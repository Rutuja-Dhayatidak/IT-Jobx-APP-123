const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");

const listDBs = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log("Connected successfully!");

    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log("\n--- DATABASES ON CLUSTER ---");
    dbs.databases.forEach(db => {
      console.log(`- ${db.name} (Size: ${db.sizeOnDisk} bytes)`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
};

listDBs();
