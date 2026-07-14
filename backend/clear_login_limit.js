const mongoose = require('mongoose');

const mongoUri = "mongodb://Job-Portal:Job-Portal123@ac-yjg0lfm-shard-00-00.3ybgryr.mongodb.net:27017,ac-yjg0lfm-shard-00-01.3ybgryr.mongodb.net:27017,ac-yjg0lfm-shard-00-02.3ybgryr.mongodb.net:27017/job-portal?ssl=true&replicaSet=atlas-5gf3kk-shard-0&authSource=admin&retryWrites=true&w=majority";

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully. Dropping login_rate_limits and global_rate_limits collections...");
    
    const collectionsToDrop = ['login_rate_limits', 'global_rate_limits', 'register_rate_limits'];
    for (const coll of collectionsToDrop) {
      const collections = await mongoose.connection.db.listCollections({ name: coll }).toArray();
      if (collections.length > 0) {
        await mongoose.connection.db.dropCollection(coll);
        console.log(`Collection '${coll}' dropped successfully!`);
      } else {
        console.log(`Collection '${coll}' does not exist or is already deleted.`);
      }
    }
  } catch (err) {
    console.error("Error occurred:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run();
