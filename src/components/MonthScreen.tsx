"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addJob } from "@/app/month/actions";
import { formatMoney } from "@/lib/money";
import { JobSheet, type JobDraft } from "@/components/JobSheet";
import { useCountUp } from "@/components/useCountUp";

export function MonthScreen({
  month,
  moneyIn,
  moneyOut,
}: {
  month: string;
  moneyIn: number;
  moneyOut: number;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // What we have added locally but the server has not confirmed yet. The
  // number moves the instant he taps, not when the round trip lands.
  const [pendingIn, setPendingIn] = useState(0);
  const [pendingOut, setPendingOut] = useState(0);

  // When fresh server totals arrive they already include the new job, so
  // the local addition has to be dropped or it would count twice.
  const serverKey = `${moneyIn}:${moneyOut}`;
  const lastKey = useRef(serverKey);
  useEffect(() => {
    if (lastKey.current !== serverKey) {
      lastKey.current = serverKey;
      setPendingIn(0);
      setPendingOut(0);
    }
  }, [serverKey]);

  const totalIn = moneyIn + pendingIn;
  const totalOut = moneyOut + pendingOut;
  const profit = totalIn - totalOut;
  const inBlack = profit >= 0;

  const shownProfit = useCountUp(profit);
  const shownIn = useCountUp(totalIn);
  const shownOut = useCountUp(totalOut);

  function save(draft: JobDraft) {
    setError(null);
    setOpen(false);

    setPendingIn((n) => n + draft.price);
    setPendingOut((n) => n + draft.cost);

    // A short tick, so a save is felt as well as seen.
    navigator.vibrate?.(12);

    startTransition(async () => {
      const result = await addJob(draft);

      if (!result.ok) {
        setPendingIn((n) => n - draft.price);
        setPendingOut((n) => n - draft.cost);
        setError(result.message);
        setOpen(true);
        return;
      }

      router.refresh();
    });
  }

  return (
    <main className={`screen screen--field${inBlack ? "" : " screen--red"}`}>
      <div className="field">
        <p className="month">{month}</p>

        {/* The waterline sits at break-even. Above it is a month in the
            black, below it is a month in the red — a cue that still works
            with every trace of colour removed. */}
        <div className="gauge">
          <div className="zone zone--up">
            {inBlack ? <p className="hero">{formatMoney(shownProfit)}</p> : null}
          </div>
          <div className="waterline" aria-hidden="true" />
          <div className="zone zone--down">
            {inBlack ? null : <p className="hero">{formatMoney(shownProfit)}</p>}
          </div>
        </div>

        <dl className="refs">
          <div className="ref">
            <dt>Money in</dt>
            <dd>{formatMoney(shownIn)}</dd>
          </div>
          <div className="ref">
            <dt>Money out</dt>
            <dd>{formatMoney(shownOut)}</dd>
          </div>
        </dl>

        <div className="spacer" />

        <button
          className="btn btn--field"
          type="button"
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
        >
          Job done
        </button>
      </div>

      {open ? (
        <JobSheet onClose={() => setOpen(false)} onSave={save} error={error} />
      ) : null}
    </main>
  );
}
