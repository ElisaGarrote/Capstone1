// Helper functions for retention calculations (90-day retention)
export function msForDays(days) {
  return days * 24 * 60 * 60 * 1000;
}

export function msSince(deletedAt) {
  if (!deletedAt) return null;
  const t = new Date(deletedAt).getTime();
  if (Number.isNaN(t)) return null;
  return Date.now() - t;
}

export function isEligible(deletedAt, retentionDays = 90) {
  const ms = msSince(deletedAt);
  if (ms === null) return false;
  return ms >= msForDays(retentionDays);
}

export function daysUntilEligible(deletedAt, retentionDays = 90) {
  const ms = msSince(deletedAt);
  if (ms === null) return null;
  const remaining = msForDays(retentionDays) - ms;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / msForDays(1));
}

export default {
  msForDays,
  msSince,
  isEligible,
  daysUntilEligible,
};
