const mongoose = require('mongoose');
const Role = require('../src/models/Role'); 
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexthire';

const addTrustRole = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const exists = await Role.findOne({ name: 'Trust & Safety' });
    if (exists) {
      console.log('Trust & Safety role already exists');
    } else {
      await Role.create({
        name: 'Trust & Safety',
        description: 'Manages platform security, reports, and KYC verification.',
        modules: [
          'Dashboard',
          'Reported Users',
          'Reported Jobs',
          'Content Moderation',
          'Fraud Detection',
          'KYC Verification',
          'Blocked Accounts',
          'Audit Logs'
        ]
      });
      console.log('Trust & Safety role created successfully');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error adding role:', err);
    process.exit(1);
  }
};

addTrustRole();
