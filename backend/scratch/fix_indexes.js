const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('candidates');

    console.log('Checking indexes on candidates collection...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    const phoneIndex = indexes.find(idx => idx.name === 'phone_1');
    if (phoneIndex) {
      console.log('Dropping phone_1 index...');
      await collection.dropIndex('phone_1');
      console.log('Dropped phone_1 index.');
    }

    console.log('Creating phone_1 index as unique and sparse...');
    await collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
    console.log('Created phone_1 index successfully.');

    process.exit(0);
  } catch (err) {
    console.error('Error fixing indexes:', err);
    process.exit(1);
  }
};

fixIndexes();
