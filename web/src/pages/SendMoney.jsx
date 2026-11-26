import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useApp } from "../App.jsx";

const money = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SendMoney() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useApp();
  const [contacts, setContacts] = useState([]);
  const [upi, setUpi] = useState(params.get("upi") || "");
  const [name, setName] = useState(params.get("name") || "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState(upi ? "amount" : "pick");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    api.contacts().then(setContacts).catch(() => {});
  }, []);

  function choose(c) {
    setUpi(c.upiId);
    setName(c.name);
    setStep("amount");
  }

  async function send(e) {
    e?.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await api.send({ upi, name, amount: Number(amount), note });
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
        <h2>Payment successful</h2>
        <p className="muted">Sent {money(success.amount)} to {name || upi}</p>
        <div className="card receipt">
          <div><span>To</span><b>{name || upi}</b></div>
          <div><span>UPI ID</span><b>{upi}</b></div>
          {note && <div><span>Note</span><b>{note}</b></div>}
          <div><span>Status</span><b className="ok">SUCCESS</b></div>
        </div>
        <button className="btn primary" onClick={() => navigate("/")}>Done</button>
        <button className="btn ghost" onClick={() => { setSuccess(null); setAmount(""); setNote(""); setPin(""); setStep("amount"); }}>Send more</button>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="subhead">
        <button className="back" onClick={() => (step === "pick" ? navigate("/") : setStep("pick"))}>‹</button>
        <h2>Send money</h2>
      </div>

      {step === "pick" && (
        <div className="pick-list">
          {contacts.map((c) => (
            <button className="pick-row" key={c.id} onClick={() => choose(c)}>
              <span className="person-avatar" style={{ background: c.color }}>{c.name[0]}</span>
              <span className="pick-main">
                <span className="tx-name">{c.name}</span>
                <span className="tx-sub">{c.upiId}</span>
              </span>
              <span className="chev">›</span>
            </button>
          ))}
          <button className="pick-row" onClick={() => navigate("/add-contact")}>
            <span className="person-avatar add">+</span>
            <span className="pick-main"><span className="tx-name">New / other UPI ID</span></span>
            <span className="chev">›</span>
          </button>
        </div>
      )}

      {step === "amount" && (
        <form className="card" onSubmit={send}>
          <div className="recipient">
            <span className="person-avatar" style={{ background: "#5f259f" }}>{(name || upi)[0]?.toUpperCase()}</span>
            <div>
              <div className="tx-name">{name || "UPI recipient"}</div>
              <div className="tx-sub">{upi}</div>
            </div>
          </div>
          <label className="field">
            <span>Amount</span>
            <input autoFocus inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </label>
          <label className="field">
            <span>Note (optional)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What's it for?" />
          </label>
          <label className="field">
            <span>4-digit PIN</span>
            <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" />
          </label>
          {err && <div className="error">{err}</div>}
          <button className="btn primary" disabled={busy || !amount || pin.length < 4}>
            {busy ? "Paying…" : `Pay ${money(amount || 0)}`}
          </button>
        </form>
      )}
    </div>
  );
}