const mongoose = require('mongoose');

// Helper to convert flat array ["users.view"] to [{ module: "users", actions: ["view"] }]
function migrateToNested(flatArray) {
  if (!Array.isArray(flatArray)) return [];
  
  const map = {};
  flatArray.forEach(item => {
    if (typeof item !== 'string') return;
    const [module, action] = item.split('.');
    if (module && action) {
      if (!map[module]) map[module] = new Set();
      map[module].add(action);
    }
  });

  return Object.entries(map).map(([module, actions]) => ({
    module,
    actions: Array.from(actions)
  }));
}

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://Job-Portal:Job-Portal123@ac-yjg0lfm-shard-00-00.3ybgryr.mongodb.net:27017/job-portal?ssl=true&replicaSet=atlas-5gf3kk-shard-0&authSource=admin');
    const db = mongoose.connection.db;
    const roles = await db.collection('roles').find().toArray();
    
    console.log(`Found ${roles.length} roles. Starting final migration...`);
    
    for (const role of roles) {
      // Check if it's a flat array (from our previous change)
      if (Array.isArray(role.permissions) && role.permissions.length > 0 && typeof role.permissions[0] === 'string') {
        const nested = migrateToNested(role.permissions);
        await db.collection('roles').updateOne(
          { _id: role._id }, 
          { $set: { permissions: nested } }
        );
        console.log(`Migrated role: ${role.name}`);
      } else {
        console.log(`Skipped role (already nested or empty): ${role.name}`);
      }
    }
    
    console.log('Final Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
