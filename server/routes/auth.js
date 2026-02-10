/**
 * Auth Routes
 * Admin login via email + password, JWT-based sessions
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'bondo-greens-dev-secret-change-in-prod';
const JWT_EXPIRY = '8h';

// POST /api/auth/login - Authenticate admin user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Look up admin by email
    const result = await req.app.locals.db.query(
      `SELECT id, email, password_hash, role, active
       FROM admin_users
       WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const admin = result.rows[0];

    if (!admin.active) {
      return res.status(401).json({ error: 'Account is disabled' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Sign JWT
    const token = jwt.sign(
      { sub: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Audit log
    req.app.locals.auditLog?.push({
      actor_id: admin.id,
      action: 'admin.login',
      resource_type: 'admin_user',
      resource_id: admin.id,
      status: 'success'
    });

    res.json({
      token,
      admin: { id: admin.id, email: admin.email, role: admin.role }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me - Return current admin from JWT
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.slice(7);
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch fresh admin data
    const result = await req.app.locals.db.query(
      `SELECT id, email, role, active FROM admin_users WHERE id = $1`,
      [payload.sub]
    );

    if (result.rows.length === 0 || !result.rows[0].active) {
      return res.status(401).json({ error: 'Admin account not found or disabled' });
    }

    const admin = result.rows[0];
    res.json({ admin: { id: admin.id, email: admin.email, role: admin.role } });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
