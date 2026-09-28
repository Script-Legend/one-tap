/**
 * A first-login month, so the screen answers a question the second it opens
 * instead of showing an empty zero. These seven jobs total exactly
 * $18,450 in and $6,280 out — a $12,170 month, in the black.
 */
export type SeedJob = {
  customer: string;
  job: string;
  price: number;
  cost: number;
  /** How far into the month this job landed, as a fraction. */
  at: number;
};

export const SEED_JOBS: SeedJob[] = [
  { customer: "Tanya Brooks", job: "Leaking toilet, callout", price: 310, cost: 35, at: 0.05 },
  { customer: "Sam Whitlock", job: "Blocked drain, kitchen", price: 420, cost: 45, at: 0.18 },
  { customer: "Hargreaves Build Co", job: "Rough-in, 2 units", price: 7550, cost: 2860, at: 0.3 },
  { customer: "Bailey Ngata", job: "Tap set replace x3", price: 540, cost: 180, at: 0.45 },
  { customer: "Rosa Feliciano", job: "Bathroom re-pipe", price: 6800, cost: 2310, at: 0.58 },
  { customer: "Coastal Cafe", job: "Grease trap service", price: 980, cost: 210, at: 0.72 },
  { customer: "Dave Mitchell", job: "Hot water system replace", price: 1850, cost: 640, at: 0.85 },
];

/** Spread the seed across the month so far, never into the future. */
export function seedRows(userId: string, start: Date, now: Date) {
  const elapsed = Math.max(now.getTime() - start.getTime(), 60_000);

  return SEED_JOBS.map((s) => ({
    user_id: userId,
    customer: s.customer,
    job: s.job,
    price: s.price,
    cost: s.cost,
    created_at: new Date(start.getTime() + elapsed * s.at).toISOString(),
  }));
}
