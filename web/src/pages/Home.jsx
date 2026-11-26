import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useApp } from "../App.jsx";

const money = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CATEGORY_ICON = {
  send: "↗️",
  receive: "↙️",
  recharge: "📱",
  bill: "🧾",
};

export default function Home() {
  const { user, refreshUser } = useApp();
  const [contacts, setContacts] = useState([]);
  const [txs, setTxs] = useState([]);
  const [topup, setTopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.contacts().then(setContacts).catch(() => {});
    api.transactions().then(setTxs).catch(() => {});
  }, []);

  async function doTopup() {
    await api.topup(500);
    await refreshUser();
    setTopup(false);
  }

  const actions = [
    { icon: "↗️", label: "To Mobile", to: "/send" },
    { icon: "📱", label: "Recharge", to: "/pay?type=recharge" },
    { icon: "💡", label: "Pay Bills", to: "/pay?type=bill" },
    { icon: "➕", label: "Add Contact", to: "/add-contact" },
  ];

  return (
    <div className="screen">
      <header className="home-head">
        <div>
          <div className="greet">Hi, {user.name.split(" ")[0]} 👋</div>
          <div className="balance-label">Available balance</div>
          <div className="balance">{money(user.balance)}</div>
          <button className="topup-link" onClick={() => setTopup(true)}>+ Add money</button>
        </div>
        <div className="avatar" style={{ background: user.color }}>{user.name[0]}</div>
      </header>

      <div className="quick-actions">
        {actions.map((a) => (
          <button key={a.label} className="qa" onClick={() => navigate(a.to)}>
            <span className="qa-icon">{a.icon}</span>
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      <section className="section">
        <div className="section-head">
          <h2>People</h2>
          <button className="link" onClick={() => navigate("/add-contact")}>See all</button>
        </div>
        <div className="people">
          {contacts.slice(0, 6).map((c) => (
            <button key={c.id} className="person" onClick={() => navigate(`/send?upi=${encodeURIComponent(c.upiId)}&name=${encodeURIComponent(c.name)}`)}>
              <span className="person-avatar" style={{ background: c.color }}>{c.name[0]}</span>
              <span className="person-name">{c.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Recent activity</h2>
          <button className="link" onClick={() => navigate("/history")}>See all</button>
        </div>
        <div className="tx-list">
          {txs.slice(0, 5).map((t) => (
            <div className="tx" key={t.id}>
              <span className="tx-icon">{CATEGORY_ICON[t.type] || "💳"}</span>
              <div className="tx-main">
                <div className="tx-name">{t.name}</div>
                <div className="tx-sub">{t.note || t.category || t.type}</div>
              </div>
              <div className={t.type === "receive" ? "tx-amt in" : "tx-amt out"}>
                {t.type === "receive" ? "+" : "−"}{money(t.amount)}
              </div>
            </div>
          ))}
          {txs.length === 0 && <div className="empty">No transactions yet</div>}
        </div>
      </section>

      {topup && (
        <div className="modal-backdrop" onClick={() => setTopup(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add money (demo)</h3>
            <p>Top up your wallet with ₹500. No real money is charged.</p>
            <button className="btn primary" onClick={doTopup}>Add ₹500</button>
            <button className="btn ghost" onClick={() => setTopup(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}