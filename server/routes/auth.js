const express = require('express');
const router = express.Router();

// TODO: Implement admin authentication
// POST /api/auth/login
// POST /api/auth/logout
// POST /api/auth/mfa

router.post('/login', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

module.exports = router;
