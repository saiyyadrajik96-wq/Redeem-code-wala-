import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

const money = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ICON = { send: "↗️", receive: "↙️", recharge: "📱", bill: "🧾" };

function when(ts) {
  const d = new Date(ts);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const date = sameDay
    ? "Today"
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  return `${date}, ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function History() {
  const [txs, setTxs] = useState([]);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    api.transactions().then(setTxs).catch(() => {});
  }, []);

  const list = txs.filter((t) => filter === "all" || t.type === filter);

  return (
    <div className="screen">
      <div className="subhead no-back"><h2>Transaction history</h2></div>
      <div className="chips">
        {[
          ["all", "All"],
          ["send", "Sent"],
          ["receive", "Received"],
          ["recharge", "Recharge"],
          ["bill", "Bills"],
        ].map(([k, label]) => (
          <button key={k} className={filter === k ? "chip on" : "chip"} onClick={() => setFilter(k)}>{label}</button>
        ))}
      </div>
      <div className="tx-list">
        {list.map((t) => (
          <div className="tx" key={t.id}>
            <span className="tx-icon">{ICON[t.type] || "💳"}</span>
            <div className="tx-main">
              <div className="tx-name">{t.name}</div>
              <div className="tx-sub">{when(t.createdAt)}{t.note ? " · " + t.note : ""}</div>
            </div>
            <div className={t.type === "receive" ? "tx-amt in" : "tx-amt out"}>
              {t.type === "receive" ? "+" : "−"}{money(t.amount)}
              <div className="tx-status">{t.status}</div>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="empty">No transactions in this view</div>}
      </div>
    </div>
  );
}