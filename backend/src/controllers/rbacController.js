const Role = require("../models/Role");
const { formatForDB, formatForUI } = require("../utils/permissionHelper");

// Seed default roles if they don't exist
exports.seedRoles = async (req, res) => {
  const defaultRoles = [
    "Platform Admin",
    "Finance Admin",
    "Ops Admin",
    "Support Admin",
    "Trust & Safety",
    "Content Reviewer",
    "Moderator"
  ];

  try {
    for (const roleName of defaultRoles) {
      const exists = await Role.findOne({ name: roleName });
      if (!exists) {
        await Role.create({ name: roleName, permissions: {} });
      }
    }
    res.json({ message: "Default roles seeded successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllRoles = async (req, res) => {
  const defaultRoles = [
    "Platform Admin",
    "Finance Admin",
    "Ops Admin",
    "Support Admin",
    "Trust & Safety",
    "Content Reviewer",
    "Moderator"
  ];

  try {
    // Ensure all default roles exist
    for (const roleName of defaultRoles) {
      const exists = await Role.findOne({ name: roleName });
      if (!exists) {
        await Role.create({ name: roleName, permissions: {} });
      }
    }
    
    const roles = await Role.find();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRolePermissions = async (req, res) => {
  try {
    const { roleName } = req.params;
    console.log("Fetching permissions for role:", roleName);
    
    // Using regex for case-insensitive match
    const role = await Role.findOne({ 
      name: { $regex: new RegExp(`^${roleName}$`, "i") } 
    });

    if (!role) {
      console.warn("Role not found in DB:", roleName);
      const allRoles = await Role.find();
      console.log("Available roles in collection:", allRoles.map(r => r.roleName || r.name));
      return res.status(404).json({ message: `Role '${roleName}' not found in database` });
    }
    
    // Format permissions for the UI
    const uiPermissions = formatForUI(role.permissions);
    console.log("Returning permissions for UI:", uiPermissions);
    res.json(uiPermissions);
  } catch (err) {
    console.error("RBAC Fetch Error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updatePermissions = async (req, res) => {
  try {
    const { roleName, permissions } = req.body;
    console.log("Updating permissions for role:", roleName);

    // Format permissions for DB structure
    const dbPermissions = formatForDB(permissions);
    console.log("Saving structured permissions:", dbPermissions);

    const role = await Role.findOneAndUpdate(
      { name: { $regex: new RegExp(`^${roleName}$`, "i") } },
      { permissions: dbPermissions },
      { new: true }
    );

    if (!role) {
      console.warn("Role not found for update:", roleName);
      return res.status(404).json({ message: "Role not found" });
    }
    
    console.log("Permissions updated successfully for:", roleName);
    res.json({ message: "Permissions updated successfully", role });
  } catch (err) {
    console.error("RBAC Update Error:", err);
    res.status(500).json({ message: err.message });
  }
};
