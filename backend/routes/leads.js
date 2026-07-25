const express = require('express');
const rateLimit = require('express-rate-limit');
const { db } = require('../config/firebase');
const { requireAuth } = require('../middleware/auth');
const { validateLead, STATUSES } = require('../utils/validate');

const router = express.Router();

const createLeadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many submissions. Please try again later.' },
});

// PUBLIC — create a lead
router.post('/', createLeadLimiter, async (req, res) => {
  const { valid, errors, data } = validateLead(req.body);
  if (!valid) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  try {
    const ref = db.ref('leads').push();
    const lead = {
      ...data,
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    await ref.set(lead);
    res.status(201).json({ message: 'Lead submitted', id: ref.key });
  } catch (err) {
    console.error('Create lead error:', err.message);
    res.status(500).json({ message: 'Could not save your inquiry. Please try again.' });
  }
});

// PROTECTED — list all leads, newest first
router.get('/', requireAuth, async (req, res) => {
  try {
    const snapshot = await db.ref('leads').once('value');
    const raw = snapshot.val() || {};
    const leads = Object.entries(raw)
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(leads);
  } catch (err) {
    console.error('Fetch leads error:', err.message);
    res.status(500).json({ message: 'Could not fetch leads' });
  }
});

// PROTECTED — update status
router.patch('/:id', requireAuth, async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const ref = db.ref(`leads/${req.params.id}`);
    const snapshot = await ref.once('value');
    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    await ref.update({ status, updatedAt: new Date().toISOString() });
    res.json({ message: 'Status updated', status });
  } catch (err) {
    console.error('Update lead error:', err.message);
    res.status(500).json({ message: 'Could not update status' });
  }
});

module.exports = router;