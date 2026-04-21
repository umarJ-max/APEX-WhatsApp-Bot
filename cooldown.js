const cooldowns = new Map();
const COOLDOWN_MS = 15000;

export function isOnCooldown(userId) {
  if (!cooldowns.has(userId)) return false;
  return Date.now() - cooldowns.get(userId) < COOLDOWN_MS;
}

export function setCooldown(userId) {
  cooldowns.set(userId, Date.now());
}

export function getRemainingCooldown(userId) {
  return Math.ceil((COOLDOWN_MS - (Date.now() - cooldowns.get(userId))) / 1000);
}
