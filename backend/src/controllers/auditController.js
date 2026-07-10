const AuditLog = require("../models/AuditLog");

/**
 * Get all audit logs with advanced filtering
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const { 
      module, 
      action, 
      status, 
      severity, 
      startDate, 
      endDate, 
      search, 
      page = 1, 
      limit = 20 
    } = req.query;

    const query = {};

    if (module) query.module = module;
    if (action) query.action = action.toUpperCase();
    if (status) query.status = status.toLowerCase();
    if (severity) query.severity = severity.toLowerCase();

    // Date Range Filter
    if (startDate || endDate) {
      query.performedAt = {};
      if (startDate) query.performedAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.performedAt.$lte = end;
      }
    }

    // Search by Admin Name, ID or Trace ID
    if (search) {
      query.$or = [
        { adminName: { $regex: search, $options: 'i' } },
        { targetId: search },
        { traceId: search }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const logs = await AuditLog.find(query)
      .sort({ performedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      logs,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get specific log details
 */
exports.getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: "Log not found" });
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
