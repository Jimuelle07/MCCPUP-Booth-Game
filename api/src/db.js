import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const dataDir = path.join(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'leaderboard.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Migration: older databases (from before round count was tracked) won't
// have this column yet.
const hasRoundsColumn = db
  .prepare('PRAGMA table_info(scores)')
  .all()
  .some((col) => col.name === 'rounds');
if (!hasRoundsColumn) {
  db.exec('ALTER TABLE scores ADD COLUMN rounds INTEGER');
}

export default db;
