import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

// Smoke-test route the admin dashboard calls right after sign-in to learn
// whether this account has actually been approved as an admin.
router.get('/whoami', requireAdmin, (req, res) => {
  res.json({ email: req.admin.email });
});

export default router;
