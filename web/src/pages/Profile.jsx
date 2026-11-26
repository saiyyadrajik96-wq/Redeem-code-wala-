import React from "react";
import { useApp } from "../App.jsx";

const money = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Profile() {
  const { user, logout } = useApp();
  return (
    <div className="screen">
      <div className="subhead no-back"><h2>Profile</h2></div>
      <div className="profile-card">
        <div className="avatar big" style={{ background: user.color }}>{user.name[0]}</div>
        <div className="profile-name">{user.name}</div>
        <div className="muted">+91 {user.phone}</div>
        <div className="upi-chip">{user.upiId}</div>
      </div>

      <div className="card stat-row">
        <div><span className="stat-label">Balance</span><span className="stat-value">{money(user.balance)}</span></div>
        <div className="divider" />
        <div><span className="stat-label">UPI handle</span><span className="stat-value small">{user.upiId.split("@")[1]?.toUpperCase()}</span></div>
      </div>

      <div className="menu">
        <div className="menu-row"><span>🔒 Security</span><span className="chev">›</span></div>
        <div className="menu-row"><span>🏦 Linked bank</span><span className="chev">›</span></div>
        <div className="menu-row"><span>🌐 Language</span><span className="chev">›</span></div>
        <div className="menu-row"><span>❓ Help & support</span><span className="chev">›</span></div>
      </div>

      <button className="btn danger" onClick={logout}>Log out</button>
      <p className="auth-foot">BharatPay demo · v1.0</p>
    </div>
  );
}