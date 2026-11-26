import React, { useState } from "react";
import { api } from "../api.js";
import { useApp } from "../App.jsx";

export default function Login() {
  const { onAuth } = useApp();
  const [mode, setMode] = useState("login");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = mode === "login" ? await api.login(phone, pin) : await api.register(name, phone, pin);
      onAuth(res.token, res.user);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  function fillDemo() {
    setMode("login");
    setPhone("9876543210");
    setPin("1234");
    setErr("");
  }

  return (
    <div className="auth">
      <div className="auth-hero">
        <div className="logo">₹</div>
        <h1>BharatPay</h1>
        <p>Bharat ka apna payments app</p>
      </div>
      <form className="card auth-card" onSubmit={submit}>
        <div className="segmented">
          <button type="button" className={mode === "login" ? "on" : ""} onClick={() => setMode("login")}>Log in</button>
          <button type="button" className={mode === "register" ? "on" : ""} onClick={() => setMode("register")}>Sign up</button>
        </div>
        {mode === "register" && (
          <label className="field">
            <span>Full name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </label>
        )}
        <label className="field">
          <span>Mobile number</span>
          <input inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" maxLength={10} />
        </label>
        <label className="field">
          <span>{mode === "login" ? "4-digit PIN" : "Set a 4-digit PIN"}</span>
          <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" maxLength={4} />
        </label>
        {err && <div className="error">{err}</div>}
        <button className="btn primary" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
        <button type="button" className="btn ghost" onClick={fillDemo}>Use demo account</button>
      </form>
      <p className="auth-foot">Demo app · No real money is moved</p>
    </div>
  );
}