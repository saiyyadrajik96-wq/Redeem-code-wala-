import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function AddContact() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await api.addContact({ name, upiId, phone });
      navigate(-1);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen">
      <div className="subhead">
        <button className="back" onClick={() => navigate(-1)}>‹</button>
        <h2>Add contact</h2>
      </div>
      <form className="card" onSubmit={save}>
        <label className="field"><span>Name</span>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Contact name" /></label>
        <label className="field"><span>UPI ID</span>
          <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@bank" /></label>
        <label className="field"><span>Mobile (optional)</span>
          <input inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number" /></label>
        {err && <div className="error">{err}</div>}
        <button className="btn primary" disabled={busy || !name || !upiId}>{busy ? "Saving…" : "Save contact"}</button>
      </form>
    </div>
  );
}