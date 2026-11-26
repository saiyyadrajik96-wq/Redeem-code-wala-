#!/usr/bin/env bash
# Start BharatPay backend + frontend together.
set -e
cd "$(dirname "$0")"

if [ ! -f server/data/db.json ]; then
  (cd server && npm run seed)
fi

echo "Starting backend on :4000 ..."
(cd server && node index.js) &
BACK_PID=$!

echo "Starting frontend on :5173 ..."
(cd web && npm run dev) &
WEB_PID=$!

trap "kill $BACK_PID $WEB_PID 2>/dev/null" INT TERM
wait