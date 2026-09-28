/**
 * Money and month helpers.
 *
 * Everything is stored in dollars as numeric(10,2) and handled as a number.
 * The month window is computed in Australian eastern time, not the server's
 * timezone and not the phone's — this is an Australian product, and "this
 * month" has to mean the same thing to the tradie and to his accountant.
 */

export const TZ = "Australia/Sydney";

const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** $12,170 — and −$2,780 with a real minus sign, not a hyphen. */
export function formatMoney(cents: number): string {
  const rounded = Math.round(cents);
  const body = AUD.format(Math.abs(rounded));
  return rounded < 0 ? `−${body}` : body;
}

/** How far the offset of `tz` sits from UTC at a given instant, in ms. */
function offsetMs(at: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");

  const asIfUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );

  return asIfUTC - at.getTime();
}

/** The instant the current month began, in `TZ`. */
export function monthStart(now: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");

  const wallClock = Date.UTC(get("year"), get("month") - 1, 1, 0, 0, 0);

  // Two passes so the answer is still right when the month starts on a
  // daylight-saving boundary.
  let instant = wallClock - offsetMs(new Date(wallClock), TZ);
  instant = wallClock - offsetMs(new Date(instant), TZ);

  return new Date(instant);
}

/** "September" */
export function monthName(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: TZ,
    month: "long",
  }).format(now);
}

export type Totals = {
  moneyIn: number;
  moneyOut: number;
  profit: number;
};

export function totalsFrom(rows: { price: number; cost: number }[]): Totals {
  const moneyIn = rows.reduce((sum, r) => sum + Number(r.price), 0);
  const moneyOut = rows.reduce((sum, r) => sum + Number(r.cost), 0);
  return { moneyIn, moneyOut, profit: moneyIn - moneyOut };
}
