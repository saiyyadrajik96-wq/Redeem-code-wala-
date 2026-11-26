# BharatPay — PhonePe-style UPI app (full-stack)

A full-stack clone of a PhonePe-style Indian UPI payments app: login, home with
balance, send money to contacts/UPI IDs, mobile recharge, bill payments,
transaction history, profile, and add-contact. Purple mobile-first UI.

> Demo only — no real money is moved and no real payment gateway is integrated.

## Structure

```
server/   Express + JSON-file datastore (pure-JS deps, no native builds)
web/      Vite + React (mobile-first, max-width 440px phone frame)
```

## Run

```bash
# 1. Backend (port 4000)
cd server
npm install
npm run seed      # optional: loads demo data
npm start

# 2. Frontend (port 5173, proxies /api -> :4000)
cd web
npm install
npm run dev
```

Open http://localhost:5173

### Demo account
- Mobile: `9876543210`
- PIN: `1234`
- Or click **Use demo account** on the login screen.

## API

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/login` | phone + pin → JWT |
| POST | `/api/auth/register` | name + phone + pin → JWT |
| GET  | `/api/me` | current user + balance |
| GET/POST | `/api/contacts` | list / add contacts |
| GET  | `/api/transactions` | history |
| POST | `/api/send` | send money (debits you, credits internal UPI) |
| POST | `/api/pay` | recharge / bill pay |
| POST | `/api/topup` | demo wallet top-up |

## APK (later)

The web build is the first target. For an Android APK, the UI is structured to
port to Expo/React Native (screens are in `web/src/pages`). A follow-up can add
an `app/` Expo project reusing the same API.