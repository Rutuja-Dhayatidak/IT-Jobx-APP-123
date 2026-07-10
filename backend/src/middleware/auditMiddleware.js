const AuditLog = require("../models/AuditLog");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const UAParser = require("ua-parser-js");

/**
 * Mask sensitive data (emails, tokens, etc.)
 */
function maskData(obj) {
  if (!obj) return obj;
  const masked = JSON.parse(JSON.stringify(obj));
  
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'cvv'];
  
  const traverse = (item) => {
    for (let key in item) {
      if (typeof item[key] === 'object') {
        traverse(item[key]);
      } else {
        if (sensitiveFields.some(f => key.toLowerCase().includes(f))) {
          item[key] = "********";
        } else if (key === 'email' && typeof item[key] === 'string') {
          const [user, domain] = item[key].split('@');
          item[key] = `${user.substring(0, 3)}****@${domain}`;
        }
      }
    }
  };

  traverse(masked);
  return masked;
}

/**
 * Compare two objects and return only changed fields (masked)
 */
function getChangedFields(oldDoc, newDoc) {
  const changes = {};
  if (!oldDoc || !newDoc) return changes;

  const oldData = oldDoc.toObject ? oldDoc.toObject() : oldDoc;
  const newData = newDoc.toObject ? newDoc.toObject() : newDoc;

  Object.keys(newData).forEach(key => {
    if (['_id', '__v', 'createdAt', 'updatedAt', 'password'].includes(key)) return;

    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      changes[key] = newData[key];
    }
  });

  return maskData(changes);
}

/**
 * Automatic Severity Mapping
 */
const getSeverity = (action) => {
  const map = {
    DELETE: "critical",
    BLOCK: "high",
    SUSPEND: "high",
    REVOKE: "critical",
    UPDATE: "medium",
    APPROVE: "medium",
    CREATE: "low",
    VIEW: "low",
    LOGIN: "low"
  };
  return map[action.toUpperCase()] || "low";
};

/**
 * Production-grade Logging Middleware
 */
const logAction = (moduleName, actionName) => {
  return async (req, res, next) => {
    const traceId = `tr-${uuidv4().split('-')[0]}`;
    req.traceId = traceId;
    const performedAt = new Date();

    const originalJson = res.json;
    const ua = new UAParser(req.headers['user-agent']).getResult();
    
    res.json = function (data) {
      const statusCode = res.statusCode;
      
      (async () => {
        try {
          if (!req.user) return;

          const finalAction = req.actionName || actionName;
          const status = statusCode < 400 ? "success" : "failed";
          
          let finalOldData = req.oldData || null;
          let finalNewData = req.newData || req.body || null;

          if (req.oldData && req.newData) {
            const changesOld = getChangedFields(req.newData, req.oldData);
            const changesNew = getChangedFields(req.oldData, req.newData);
            finalOldData = Object.keys(changesOld).length > 0 ? changesOld : null;
            finalNewData = Object.keys(changesNew).length > 0 ? changesNew : null;
          } else {
            finalOldData = maskData(finalOldData);
            finalNewData = maskData(finalNewData);
          }

          const displayMessage = req.description || `${req.user.name || 'Admin'} performed ${finalAction} on ${moduleName}`;

          await mongoose.connection.collection('auditlogs').insertOne({
            adminId: req.user._id || req.user.id,
            adminName: req.user.name || req.user.email,
            role: req.user.role,
            module: moduleName,
            action: finalAction.toUpperCase(),
            displayMessage: displayMessage,
            targetId: req.params.id || req.body?.id || "N/A",
            oldData: finalOldData,
            newData: finalNewData,
            reason: req.reason || req.body?.reason || "Administrative operation",
            status: status,
            severity: getSeverity(finalAction),
            ipAddress: req.ip || req.headers['x-forwarded-for'] || "127.0.0.1",
            userAgent: req.headers['user-agent'],
            metadata: {
              device: ua.device.type || "desktop",
              browser: `${ua.browser.name} ${ua.browser.version}`
            },
            traceId: traceId,
            performedAt: performedAt,
            createdAt: new Date()
          });
        } catch (err) {
          console.error(`[Audit Error] ${traceId}:`, err.message);
        }
      })();

      return originalJson.apply(res, arguments);
    };

    next();
  };
};

module.exports = logAction;
