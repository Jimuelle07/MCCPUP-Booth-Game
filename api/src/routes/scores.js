import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const rows = db
    .prepare('SELECT name, score, created_at FROM scores ORDER BY score DESC, created_at ASC LIMIT ?')
    .all(limit);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { name, score } = req.body ?? {};

  if (typeof name !== 'string' || name.trim().length === 0 || name.length > 24) {
    return res.status(400).json({ error: 'name must be a non-empty string up to 24 characters' });
  }
  if (!Number.isInteger(score) || score < 0 || score > 10000) {
    return res.status(400).json({ error: 'score must be an integer between 0 and 10000' });
  }

  db.prepare('INSERT INTO scores (name, score) VALUES (?, ?)').run(name.trim(), score);
  res.status(201).json({ ok: true });
});

export default router;
