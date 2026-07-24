require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');

async function seed() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.');
    process.exit(1);
  }

  const existing = await db.ref('admins').orderByChild('email').equalTo(email).once('value');
  if (existing.exists()) {
    console.log(`Admin ${email} already exists. Nothing to do.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.ref('admins').push({
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  });

  console.log(`Admin created: ${email}`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});