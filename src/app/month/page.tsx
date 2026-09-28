import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { monthName, monthStart, totalsFrom } from "@/lib/money";
import { seedRows } from "@/lib/seed";
import { MonthScreen } from "@/components/MonthScreen";

export const dynamic = "force-dynamic";

type JobRow = { price: number; cost: number };

export default async function MonthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const now = new Date();
  const start = monthStart(now);

  // A brand new account gets one realistic month, so the first thing the
  // screen does is answer the question instead of showing zero.
  const { count } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (count === 0) {
    await supabase.from("jobs").insert(seedRows(user.id, start, now));
  }

  const { data } = await supabase
    .from("jobs")
    .select("price, cost")
    .eq("user_id", user.id)
    .gte("created_at", start.toISOString());

  const totals = totalsFrom((data ?? []) as JobRow[]);

  return (
    <MonthScreen
      month={monthName(now)}
      moneyIn={totals.moneyIn}
      moneyOut={totals.moneyOut}
    />
  );
}
