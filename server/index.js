import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { getDB, mutate } from "./db.js";

const app = express();
const PORT = process.env.PORT || 4000;
const SECRET = process.env.JWT_SECRET || "bharatpay-dev-secret";

app.use(cors());
app.use(express.json());

const genId = (p) => `${p}_${randomUUID().slice(0, 8)}`;
const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  phone: u.phone,
  upiId: u.upiId,
  balance: u.balance,
  color: u.color,
});

function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.userId = jwt.verify(token, SECRET).sub;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ---- Auth ----
app.post("/api/auth/login", async (req, res) => {
  const { phone, pin } = req.body || {};
  if (!phone || !pin) return res.status(400).json({ error: "phone and pin required" });
  const db = await getDB();
  const user = db.users.find((u) => u.phone === String(phone));
  if (!user || !bcrypt.compareSync(String(pin), user.pinHash)) {
    return res.status(401).json({ error: "Invalid phone or PIN" });
  }
  const token = jwt.sign({ sub: user.id }, SECRET, { expiresIn: "7d" });
  res.json({ token, user: publicUser(user) });
});

app.post("/api/auth/register", async (req, res) => {
  const { name, phone, pin } = req.body || {};
  if (!name || !phone || !pin || String(pin).length < 4)
    return res.status(400).json({ error: "name, phone and 4-digit pin required" });
  const db = await getDB();
  if (db.users.some((u) => u.phone === String(phone)))
    return res.status(409).json({ error: "Phone already registered" });
  const user = {
    id: genId("u"),
    name: String(name),
    phone: String(phone),
    upiId: `${phone}@ybl`,
    pinHash: bcrypt.hashSync(String(pin), 10),
    balance: 0,
    color: "#5f259f",
    createdAt: Date.now(),
  };
  await mutate((d) => d.users.push(user));
  const token = jwt.sign({ sub: user.id }, SECRET, { expiresIn: "7d" });
  res.json({ token, user: publicUser(user) });
});

app.get("/api/me", auth, async (req, res) => {
  const db = await getDB();
  const user = db.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(publicUser(user));
});

// ---- Contacts ----
app.get("/api/contacts", auth, async (req, res) => {
  const db = await getDB();
  res.json(db.contacts.filter((c) => c.userId === req.userId));
});

app.post("/api/contacts", auth, async (req, res) => {
  const { name, upiId, phone } = req.body || {};
  if (!name || !upiId) return res.status(400).json({ error: "name and upiId required" });
  const contact = {
    id: genId("c"),
    userId: req.userId,
    name: String(name),
    upiId: String(upiId),
    phone: phone ? String(phone) : "",
    color: "#00897b",
  };
  await mutate((d) => d.contacts.push(contact));
  res.json(contact);
});

// ---- Transactions ----
app.get("/api/transactions", auth, async (req, res) => {
  const db = await getDB();
  const list = db.transactions
    .filter((t) => t.userId === req.userId)
    .sort((a, b) => b.createdAt - a.createdAt);
  res.json(list);
});

function makeTx(userId, data) {
  return {
    id: genId("t"),
    userId,
    type: data.type,
    name: data.name,
    upiId: data.upiId || "",
    amount: Number(data.amount),
    note: data.note || "",
    category: data.category || data.type,
    status: "SUCCESS",
    createdAt: Date.now(),
  };
}

// Send money: debit sender, credit receiver if internal
app.post("/api/send", auth, async (req, res) => {
  const { upiId, name, amount, note } = req.body || {};
  const amt = Number(amount);
  if (!upiId || !amt || amt <= 0) return res.status(400).json({ error: "upiId and positive amount required" });

  const result = await mutate((db) => {
    const me = db.users.find((u) => u.id === req.userId);
    if (me.balance < amt) return { error: "Insufficient balance" };
    const receiver = db.users.find((u) => u.upiId === upiId);
    if (receiver && receiver.id === me.id) return { error: "Cannot send to self" };
    me.balance = Math.round((me.balance - amt) * 100) / 100;
    if (receiver) receiver.balance = Math.round((receiver.balance + amt) * 100) / 100;
    const tx = makeTx(me.id, { type: "send", name: name || receiver?.name || upiId, upiId, amount: amt, note });
    db.transactions.push(tx);
    if (receiver) {
      db.transactions.push(
        makeTx(receiver.id, { type: "receive", name: me.name, upiId: me.upiId, amount: amt, note }),
      );
    }
    return { tx, balance: me.balance };
  });
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

// Recharge / bill pay (debit only)
app.post("/api/pay", auth, async (req, res) => {
  const { type, name, amount, note, category } = req.body || {};
  const amt = Number(amount);
  if (!["recharge", "bill"].includes(type) || !name || !amt || amt <= 0)
    return res.status(400).json({ error: "type, name and positive amount required" });

  const result = await mutate((db) => {
    const me = db.users.find((u) => u.id === req.userId);
    if (me.balance < amt) return { error: "Insufficient balance" };
    me.balance = Math.round((me.balance - amt) * 100) / 100;
    const tx = makeTx(me.id, { type, name, amount: amt, note, category });
    db.transactions.push(tx);
    return { tx, balance: me.balance };
  });
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

// Add money (top-up) for demo purposes
app.post("/api/topup", auth, async (req, res) => {
  const { amount } = req.body || {};
  const amt = Number(amount);
  if (!amt || amt <= 0) return res.status(400).json({ error: "positive amount required" });
  const balance = await mutate((db) => {
    const me = db.users.find((u) => u.id === req.userId);
    me.balance = Math.round((me.balance + amt) * 100) / 100;
    return me.balance;
  });
  res.json({ balance });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`BharatPay API on http://localhost:${PORT}`));