const mongoose = require('mongoose');
const Role = require('../src/models/Role'); 
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexthire';

const addOpsAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const exists = await Role.findOne({ name: 'OPS Admin' });
    if (exists) {
      console.log('OPS Admin role already exists');
    } else {
      await Role.create({
        name: 'OPS Admin',
        permissions: {
          'Job Verification': ['view', 'edit', 'approve'],
          'Employer Approval': ['view', 'edit', 'approve'],
          'Support Tickets': ['view', 'edit'],
          'Platform Vitals': ['view']
        }
      });
      console.log('OPS Admin role created successfully');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
};

addOpsAdmin();
