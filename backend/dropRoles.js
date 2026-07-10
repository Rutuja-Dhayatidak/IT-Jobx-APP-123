const mongoose = require('mongoose');
require('dotenv').config();

async function dropRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'roles' }).toArray();
    
    if (collections.length > 0) {
      await db.dropCollection('roles');
      console.log("Successfully dropped the 'roles' collection!");
    } else {
      console.log("The 'roles' collection does not exist.");
    }
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

dropRoles();
