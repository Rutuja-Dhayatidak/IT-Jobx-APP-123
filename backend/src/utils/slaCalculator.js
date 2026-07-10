const SLA_HOURS = {
  'starter':        48,
  'professional':   24,
  'enterprise':      4,
  'corporate-elite': 1,
  'free':           72,
};

exports.calculateSLA = (planTier) => {
  const hours = SLA_HOURS[(planTier || '').toLowerCase()] || 48;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

exports.getSLAStatus = (slaDueAt) => {
  if (!slaDueAt) return 'none';
  const now = Date.now();
  const due = new Date(slaDueAt).getTime();
  const total = due - new Date(slaDueAt).setHours(0, 0, 0, 0);
  const remaining = due - now;
  const pct = (remaining / total) * 100;
  
  if (remaining < 0)  return 'overdue';
  if (pct < 25)       return 'critical';
  if (pct < 50)       return 'warning';
  return 'ok';
};
