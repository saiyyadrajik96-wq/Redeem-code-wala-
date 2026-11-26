// Tiny JSON-file backed datastore. No native deps, survives restarts.
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || `${__dirname}/data/db.json`;

let cache = null;

async function load() {
  if (cache) return cache;
  try {
    cache = JSON.parse(await readFile(DB_PATH, "utf8"));
  } catch {
    cache = { users: [], contacts: [], transactions: [], recharges: [], bills: [] };
  }
  return cache;
}

async function persist() {
  await mkdir(dirname(DB_PATH), { recursive: true });
  const tmp = `${DB_PATH}.tmp`;
  await writeFile(tmp, JSON.stringify(cache, null, 2));
  await rename(tmp, DB_PATH);
}

export async function getDB() {
  return load();
}

export async function mutate(fn) {
  const db = await load();
  const result = await fn(db);
  await persist();
  return result;
}

export { DB_PATH };