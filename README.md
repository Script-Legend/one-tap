# One Tap

**Live:** _paste the Vercel URL here_
**Test it on a phone.** That is the only screen it was designed for.

One login. Then one screen that answers one question — *am I making money this month?* —
and one button that changes the answer.

---

## What it does

After signing in with Google there is a single screen. A month label, three numbers, one button.

**The waterline is the idea.** A rule runs across the screen at break-even. In a good month the
profit figure sits **above** the line. In a bad month it drops **below** it.

That matters because colour alone cannot carry the message. The first version of this design used
green and red that measured 1.21:1 apart in luminance — and **1.02:1 under simulated protanopia**.
To a colour-blind tradie, or to anyone holding a phone in direct sun, the good month and the bad
month were the same screen. Roughly one man in twelve is colour-blind. On a product built for
tradies, that is not an edge case.

The colours are now 2.59:1 apart (protanopia 2.24:1, deuteranopia 2.82:1) — and the waterline
carries the state regardless, because position survives glare, greyscale and every form of colour
blindness.

**Job done** opens a sheet: customer, job, price, and an optional materials cost. Save, and the
numbers move immediately — before the server answers. One button feeds all three figures, so
there is no second button for expenses.

A brand new account is seeded with one realistic month, so the first thing the screen does is
answer the question rather than show a zero.

## What was deliberately left out

- No nav bar, no tabs, no menu — there is nowhere else to go
- No charts and no trend lines. One number is the trend.
- No job list and no history. Jobs go in; they do not come back out.
- No settings, no profile, no onboarding, no empty-state tutorial
- No search, no filters, no date picker — it is always this month
- No email or password, no sign-up flow, no password reset
- No invoices, quotes, GST breakdown or exports

Every one of those is something a competitor ships and a tradie never asks for.

## Running it

```bash
nvm use 20
npm install
cp .env.local.example .env.local   # then fill in the two Supabase values
npm run dev
```

**Supabase setup**

1. Create a project, then paste the project URL and anon key into `.env.local`
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor — it is one table
3. Authentication → Providers → enable Google, and paste the callback URL into Google Cloud
4. Authentication → URL Configuration → add your Vercel domain to the redirect allow-list

The OAuth redirect is derived from `window.location.origin`, so localhost and the live domain
both work with no extra configuration.

## How it is built

Next.js 16 (App Router) · TypeScript · Supabase (auth + Postgres + row level security) · Vercel.

One table, `jobs`. One RLS policy — a tradie sees his own rows and nobody else's. Money in is the
sum of `price` for the month, money out the sum of `cost`, and profit is the difference. There are
no views, no functions and no second table.

```
src/
  app/
    login/           one Google button
    month/           the one screen, plus the server action that saves a job
    auth/callback/   OAuth code exchange
  components/        MonthScreen · JobSheet · useCountUp
  lib/
    money.ts         formatting, and the month window in Australian eastern time
    seed.ts          the first-login month
    supabase/        browser client, server client, session middleware
```

## Details worth knowing

- **The month is Australian eastern time**, not the server's timezone and not the phone's, so
  "this month" means the same thing to the tradie and to his accountant. Daylight saving is
  handled with a two-pass offset calculation.
- **Installable.** Add to home screen and it opens full screen with no browser bar.
- **No spinners.** Saving is optimistic; if the write fails the numbers roll back and the sheet
  reopens with the reason.
- The figure counts up when money changes, and holds still under `prefers-reduced-motion`.
- A short haptic tick on a successful save.
- Safe-area insets respected for the notch and the home bar; 64px touch targets throughout.
- Every colour pair in the interface was measured, not eyeballed. The ratios are in the comments
  at the top of `globals.css`.

## Known simplifications

This is a test build, and these were conscious calls rather than oversights.

- The seeded first month is demo data. It is inserted once, when an account has no jobs at all.
- Two browser tabs opening a brand new account at the same moment could seed it twice.
- No GST handling. That belongs in Angus Shield, not in a screen whose job is one number.
- There is no sign-out. There is also no settings screen to put it on, which is the point.
