const TOKEN_KEY = "bp_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  login: (phone, pin) => request("/auth/login", { method: "POST", body: { phone, pin } }),
  register: (name, phone, pin) => request("/auth/register", { method: "POST", body: { name, phone, pin } }),
  me: () => request("/me"),
  contacts: () => request("/contacts"),
  addContact: (c) => request("/contacts", { method: "POST", body: c }),
  transactions: () => request("/transactions"),
  send: (d) => request("/send", { method: "POST", body: d }),
  pay: (d) => request("/pay", { method: "POST", body: d }),
  topup: (amount) => request("/topup", { method: "POST", body: { amount } }),
};