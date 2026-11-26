import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useApp } from "../App.jsx";

const money = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Pay() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useApp();
  const [type, setType] = useState(params.get("type") === "bill" ? "bill" : "recharge");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("Mobile Recharge");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(null);

  const isBill = type === "bill";
  const billers = ["BESCOM Electricity", "Airtel Broadband", "Water Board", "Gas Cylinder"];
  const recharges = ["Jio Prepaid", "Airtel Prepaid", "Vi Prepaid", "BSNL Prepaid"];

  async function pay(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await api.pay({ type, name, amount: Number(amount), note, category });
      setSuccess(res);
      await refreshUser();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="screen center">
        <div className="success-burst">✓</div>
        <h2>{isBill ? "Bill paid" : "Recharge successful"}</h2>
        <p className="muted">{money(success.amount)} · {name}</p>
        <div className="card receipt">
          <div><span>Paid to</span><b>{name}</b></div>
          <div><span>Category</span><b>{category}</b></div>
          <div><span>Status</span><b className="ok">SUCCESS</b></div>
        </div>
        <button className="btn primary" onClick={() => navigate("/")}>Done</button>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="subhead">
        <button className="back" onClick={() => navigate("/")}>‹</button>
        <h2>{isBill ? "Pay bills" : "Recharge"}</h2>
      </div>

      <div className="segmented big">
        <button className={!isBill ? "on" : ""} onClick={() => { setType("recharge"); setCategory("Mobile Recharge"); setName(""); }}>📱 Recharge</button>
        <button className={isBill ? "on" : ""} onClick={() => { setType("bill"); setCategory("Electricity"); setName(""); }}>🧾 Bills</button>
      </div>

      <form className="card" onSubmit={pay}>
        <label className="field">
          <span>{isBill ? "Biller" : "Operator"}</span>
          <input list="biller-list" value={name} onChange={(e) => setName(e.target.value)} placeholder={isBill ? "Select or type biller" : "Select or type operator"} />
          <datalist id="biller-list">
            {(isBill ? billers : recharges).map((b) => <option key={b} value={b} />)}
          </datalist>
        </label>
        {isBill && (
          <label className="field">
            <span>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {["Electricity", "Broadband", "Water", "Gas", "Credit Card", "Other"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        )}
        <label className="field">
          <span>Amount</span>
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
        </label>
        <label className="field">
          <span>{isBill ? "Consumer / account no (optional)" : "Mobile number (optional)"}</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={isBill ? "e.g. 1234567890" : "10-digit number"} />
        </label>
        {err && <div className="error">{err}</div>}
        <button className="btn primary" disabled={busy || !name || !amount}>
          {busy ? "Processing…" : `${isBill ? "Pay" : "Recharge"} ${money(amount || 0)}`}
        </button>
      </form>
    </div>
  );
}