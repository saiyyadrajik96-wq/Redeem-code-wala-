import React, { createContext, useContext, useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { api, getToken, setToken, clearToken } from "./api.js";

import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import SendMoney from "./pages/SendMoney.jsx";
import Pay from "./pages/Pay.jsx";
import History from "./pages/History.jsx";
import Profile from "./pages/Profile.jsx";
import AddContact from "./pages/AddContact.jsx";

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api.me().then(setUser).catch(clearToken).finally(() => setLoading(false));
  }, []);

  const onAuth = (token, u) => {
    setToken(token);
    setUser(u);
    navigate("/");
  };
  const logout = () => {
    clearToken();
    setUser(null);
    navigate("/login");
  };
  const refreshUser = () => api.me().then(setUser).catch(() => {});

  if (loading) return <div className="splash"><div className="spinner" /></div>;

  const authed = !!user && getToken();

  return (
    <AppCtx.Provider value={{ user, setUser, onAuth, logout, refreshUser }}>
      <div className="phone">
        <Routes>
          <Route path="/login" element={authed ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/" element={authed ? <Home /> : <Navigate to="/login" replace />} />
          <Route path="/send" element={authed ? <SendMoney /> : <Navigate to="/login" replace />} />
          <Route path="/pay" element={authed ? <Pay /> : <Navigate to="/login" replace />} />
          <Route path="/history" element={authed ? <History /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={authed ? <Profile /> : <Navigate to="/login" replace />} />
          <Route path="/add-contact" element={authed ? <AddContact /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to={authed ? "/" : "/login"} replace />} />
        </Routes>
        {authed && location.pathname !== "/login" && <TabBar />}
      </div>
    </AppCtx.Provider>
  );
}

function TabBar() {
  const navigate = useNavigate();
  const loc = useLocation();
  const tabs = [
    { to: "/", icon: "🏠", label: "Home" },
    { to: "/history", icon: "🕘", label: "History" },
    { to: "/profile", icon: "👤", label: "Profile" },
  ];
  return (
    <nav className="tabbar">
      {tabs.map((t) => (
        <button
          key={t.to}
          className={loc.pathname === t.to ? "tab active" : "tab"}
          onClick={() => navigate(t.to)}
        >
          <span className="tab-icon">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default App;