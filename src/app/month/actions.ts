"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AddJobResult = { ok: true } | { ok: false; message: string };

export async function addJob(input: {
  customer: string;
  job: string;
  price: number;
  cost: number;
}): Promise<AddJobResult> {
  const customer = input.customer.trim();
  const job = input.job.trim();

  if (!customer) return { ok: false, message: "Add the customer's name." };
  if (!job) return { ok: false, message: "Add what the job was." };

  const price = Number(input.price);
  const cost = Number(input.cost);

  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, message: "That price does not look right." };
  }
  if (!Number.isFinite(cost) || cost < 0) {
    return { ok: false, message: "That materials cost does not look right." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Your session expired. Sign in again." };

  const { error } = await supabase.from("jobs").insert({
    user_id: user.id,
    customer,
    job,
    price,
    cost,
  });

  if (error) {
    return { ok: false, message: "Could not save that job. Try again." };
  }

  revalidatePath("/month");
  return { ok: true };
}
