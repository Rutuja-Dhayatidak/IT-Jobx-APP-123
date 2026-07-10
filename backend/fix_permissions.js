const mongoose = require('mongoose');
require('dotenv').config();
const Candidate = require('./src/models/Candidate');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB for Strict Cleanup...");
    
    const users = await Candidate.find({});
    let fixedCount = 0;

    for (const user of users) {
      let needsFix = false;

      // Check if permissions is missing or not an array
      if (!Array.isArray(user.permissions)) {
        needsFix = true;
      } else {
        // Check for weird strings like "[{}]" or empty/invalid elements
        for (const p of user.permissions) {
          if (typeof p !== 'string' || p === "[{}]" || p === "" || p.includes("{")) {
            needsFix = true;
            break;
          }
        }
      }

      if (needsFix) {
        console.log(`Resetting corrupted permissions for: ${user.email}`);
        user.permissions = []; // Reset to safe state
        await user.save();
        fixedCount++;
      }
    }

    console.log(`Strict Cleanup Complete. Fixed ${fixedCount} users.`);
    process.exit(0);
  })
  .catch(err => {
    console.error("Cleanup Failed:", err);
    process.exit(1);
  });
