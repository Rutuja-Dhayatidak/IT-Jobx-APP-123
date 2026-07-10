/**
 * Convert a nested module-based permissions object (from UI) into a structured array of objects (for DB).
 * { Users: ["view"] } -> [{ module: "users", actions: ["view"] }]
 */
exports.formatForDB = (permissionsObj) => {
  if (!permissionsObj || typeof permissionsObj !== 'object') return [];

  return Object.entries(permissionsObj).map(([module, actions]) => ({
    module: module.trim(),
    actions: Array.isArray(actions) ? actions.map(a => a.toLowerCase().trim()) : []
  })).filter(p => p.actions.length > 0);
};

/**
 * Convert a structured array of objects (from DB) back to a nested module-based object (for UI).
 * [{ module: "users", actions: ["view"] }] -> { Users: ["view"] }
 */
exports.formatForUI = (dbPermissions) => {
  if (!Array.isArray(dbPermissions)) return {};

  return dbPermissions.reduce((acc, current) => {
    if (!current.module) return acc;
    
    // Capitalize module for UI
    const capitalizedModule = current.module.charAt(0).toUpperCase() + current.module.slice(1);
    acc[capitalizedModule] = current.actions || [];
    
    return acc;
  }, {});
};
