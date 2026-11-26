// Seed demo data. Run: npm run seed
import bcrypt from "bcryptjs";
import { mutate } from "./db.js";

const UPI = "9876543210@ybl";

await mutate((db) => {
  if (db.users.length > 0) {
    console.log("DB already seeded, skipping.");
    return;
  }

  const pinHash = bcrypt.hashSync("1234", 10);
  const now = Date.now();
  const day = 86400000;

  const me = {
    id: "u_me",
    name: "Aarav Sharma",
    phone: "9876543210",
    upiId: UPI,
    pinHash,
    balance: 12450.75,
    color: "#5f259f",
    createdAt: now - 40 * day,
  };
  db.users.push(me);

  const contacts = [
    { id: "c1", userId: me.id, name: "Priya Nair", upiId: "priya@ybl", phone: "9812345678", color: "#e91e63" },
    { id: "c2", userId: me.id, name: "Rahul Verma", upiId: "rahul.v@okaxis", phone: "9898989898", color: "#00897b" },
    { id: "c3", userId: me.id, name: "Sneha Iyer", upiId: "sneha@paytm", phone: "9744556677", color: "#fb8c00" },
    { id: "c4", userId: me.id, name: "Vikram Singh", upiId: "vikram.s@oksbi", phone: "9700112233", color: "#3949ab" },
    { id: "c5", userId: me.id, name: "Mom", upiId: "mom.family@ybl", phone: "9000011111", color: "#8e24aa" },
    { id: "c6", userId: me.id, name: "Chai Tapri", upiId: "chaitapri@ibl", phone: "9111122222", color: "#6d4c41" },
  ];
  db.contacts.push(...contacts);

  const tx = (t) => ({
    id: t.id,
    userId: me.id,
    type: t.type,
    name: t.name,
    upiId: t.upiId || "",
    amount: t.amount,
    note: t.note || "",
    category: t.category || t.type,
    status: "SUCCESS",
    createdAt: now - t.ago * day,
  });

  db.transactions.push(
    tx({ id: "t1", type: "receive", name: "Priya Nair", upiId: "priya@ybl", amount: 850, note: "Dinner split", ago: 0.2 }),
    tx({ id: "t2", type: "send", name: "Rahul Verma", upiId: "rahul.v@okaxis", amount: 1200, note: "Movie tickets", ago: 1 }),
    tx({ id: "t3", type: "recharge", name: "Jio Prepaid", amount: 299, category: "Mobile Recharge", note: "9876543210", ago: 2 }),
    tx({ id: "t4", type: "bill", name: "BESCOM Electricity", amount: 1540, category: "Electricity", note: "Oct bill", ago: 3 }),
    tx({ id: "t5", type: "send", name: "Chai Tapri", upiId: "chaitapri@ibl", amount: 60, note: "Cutting chai", ago: 4 }),
    tx({ id: "t6", type: "receive", name: "Sneha Iyer", upiId: "sneha@paytm", amount: 2500, note: "Trip contribution", ago: 5 }),
    tx({ id: "t7", type: "bill", name: "Airtel Broadband", amount: 999, category: "Broadband", note: "Monthly", ago: 6 }),
    tx({ id: "t8", type: "send", name: "Mom", upiId: "mom.family@ybl", amount: 5000, note: "Home", ago: 8 }),
    tx({ id: "t9", type: "recharge", name: "Airtel DTH", amount: 350, category: "DTH", note: "Family TV", ago: 10 }),
    tx({ id: "t10", type: "receive", name: "Vikram Singh", upiId: "vikram.s@oksbi", amount: 3200, note: "Rent share", ago: 12 }),
  );

  console.log("Seeded demo user:", me.name, "<", me.phone, "> PIN 1234");
});