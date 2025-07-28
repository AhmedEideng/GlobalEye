type RateLimitStore = {
  [key: string]: number;
};

const store: RateLimitStore = {};

export default function rateLimit(
  key: string,
  limit: number,
  duration: number = 60000 // Lock duration in milliseconds (1 minute)
): boolean {
  const now = Date.now();
  if (!store[key] || store[key] + duration < now) {
    store[key] = now;
    return true;
  }
  return false;
}
