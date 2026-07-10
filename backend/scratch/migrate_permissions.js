const mongoose = require('mongoose');

// Inlined helper to avoid require issues
function flattenPermissions(permissionsObj) {
  if (!permissionsObj || typeof permissionsObj !== 'object') return [];
  const flatArray = [];
  Object.entries(permissionsObj).forEach(([module, actions]) => {
    if (Array.isArray(actions)) {
      actions.forEach(action => {
        const cleanModule = module.toLowerCase().trim();
        flatArray.push(`${cleanModule}.${action.toLowerCase().trim()}`);
      });
    }
  });
  return [...new Set(flatArray)];
}

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://Job-Portal:Job-Portal123@ac-yjg0lfm-shard-00-00.3ybgryr.mongodb.net:27017/job-portal?ssl=true&replicaSet=atlas-5gf3kk-shard-0&authSource=admin');
    const db = mongoose.connection.db;
    const roles = await db.collection('roles').find().toArray();
    
    console.log(`Found ${roles.length} roles. Starting migration...`);
    
    for (const role of roles) {
      // Check if it's an object (Map looks like object in MongoDB but not Array)
      if (role.permissions && !Array.isArray(role.permissions)) {
        const flat = flattenPermissions(role.permissions);
        await db.collection('roles').updateOne(
          { _id: role._id }, 
          { $set: { permissions: flat } }
        );
        console.log(`Migrated role: ${role.name}`);
      } else {
        console.log(`Skipped role (already flat or empty): ${role.name}`);
      }
    }
    
    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
