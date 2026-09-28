"use client";

import { useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/money";

/** "1,850" / "$1,850" / "1850.50" -> 1850.5 */
function parseMoney(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : 0;
}

export type JobDraft = {
  customer: string;
  job: string;
  price: number;
  cost: number;
};

export function JobSheet({
  onClose,
  onSave,
  error,
}: {
  onClose: () => void;
  onSave: (draft: JobDraft) => void;
  error: string | null;
}) {
  const [customer, setCustomer] = useState("");
  const [job, setJob] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");

  const priceRef = useRef<HTMLInputElement>(null);

  // The price is what he is really here to type, so it gets the keyboard.
  useEffect(() => {
    priceRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const amount = parseMoney(price);
  const ready = customer.trim() !== "" && job.trim() !== "" && amount > 0;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready) return;
    onSave({
      customer: customer.trim(),
      job: job.trim(),
      price: amount,
      cost: parseMoney(cost),
    });
  }

  return (
    <>
      <button
        className="scrim"
        type="button"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        <div className="grab" />
        <h2 id="sheet-title">Job done</h2>

        <form onSubmit={submit}>
          <div className="row">
            <p className="lab">
              <span>Customer</span>
            </p>
            <input
              className="val"
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Dave Mitchell"
              autoComplete="off"
              aria-label="Customer"
            />
          </div>

          <div className="row">
            <p className="lab">
              <span>Job</span>
            </p>
            <input
              className="val"
              type="text"
              value={job}
              onChange={(e) => setJob(e.target.value)}
              placeholder="Hot water system replace"
              autoComplete="off"
              aria-label="Job"
            />
          </div>

          <div className="row">
            <p className="lab">
              <span>Price</span>
            </p>
            <input
              className="val val--money"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="$0"
              autoComplete="off"
              aria-label="Price"
              ref={priceRef}
            />
          </div>

          <div className="row">
            <p className="lab">
              <span>Materials cost</span>
              <span className="opt">Optional</span>
            </p>
            <input
              className="val val--money val--cost"
              type="text"
              inputMode="decimal"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="$0"
              autoComplete="off"
              aria-label="Materials cost, optional"
            />
          </div>

          {error ? <p className="sheet-error">{error}</p> : null}

          <div className="sheet-actions">
            <button className="btn btn--confirm" type="submit" disabled={!ready}>
              {amount > 0 ? `Add ${formatMoney(amount)}` : "Add"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
