/**
 * Admin Routes
 * Dashboard, event management, reporting
 * Requires authentication (TODO: implement auth middleware)
 */

const express = require('express');
const router = express.Router();

// GET /api/admin/events/:event_id/dashboard - Admin dashboard for event
router.get('/events/:event_id/dashboard', async (req, res, next) => {
  try {
    const { event_id } = req.params;

    // Get event details
    const eventResult = await req.app.locals.db.query(
      `SELECT id, name, event_date, max_capacity FROM events WHERE id = $1`,
      [event_id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get registration counts
    const countResult = await req.app.locals.db.query(
      `SELECT 
        COUNT(*) as total_registrations,
        SUM(CASE WHEN checked_in THEN 1 ELSE 0 END) as checked_in_count
       FROM registrations
       WHERE event_id = $1`,
      [event_id]
    );

    // Get merchandise summary
    const merchResult = await req.app.locals.db.query(
      `SELECT item_type, size, total_available, total_allocated, total_checked_in
       FROM merchandise_inventory
       WHERE event_id = $1
       ORDER BY item_type, size`,
      [event_id]
    );

    res.json({
      event: eventResult.rows[0],
      registrations: {
        total: parseInt(countResult.rows[0].total_registrations),
        checked_in: parseInt(countResult.rows[0].checked_in_count) || 0
      },
      merchandise: merchResult.rows
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/admin/events/:event_id/registrations - List registrations for admin
router.get('/events/:event_id/registrations', async (req, res, next) => {
  try {
    const { event_id } = req.params;
    const page = parseInt(req.query.page) || 0;
    const limit = 100;
    const offset = page * limit;

    const result = await req.app.locals.db.query(
      `SELECT 
        id, first_name, last_name, email, phone,
        events_attending, shirts, meals, guests,
        checked_in, created_at
       FROM registrations
       WHERE event_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [event_id, limit, offset]
    );

    res.json({
      registrations: result.rows,
      page,
      limit
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/admin/events - Create new event
router.post('/events', async (req, res, next) => {
  try {
    const { name, location, event_date, max_capacity } = req.body;

    const result = await req.app.locals.db.query(
      `INSERT INTO events (name, location, event_date, max_capacity)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [name, location, event_date, max_capacity]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    next(error);
  }
});

module.exports = router;
