/**
 * Admin Routes
 * Dashboard, event management, inventory, reporting
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
      `SELECT id, name, description, location, event_date, max_capacity, status, registration_open
       FROM events WHERE id = $1`,
      [event_id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get registration counts with status breakdown
    const countResult = await req.app.locals.db.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN checked_in THEN 1 ELSE 0 END) as checked_in,
        SUM(CASE WHEN status = 'registered' THEN 1 ELSE 0 END) as status_registered,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as status_confirmed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as status_cancelled
       FROM registrations
       WHERE event_id = $1`,
      [event_id]
    );

    // Get merchandise summary
    const merchResult = await req.app.locals.db.query(
      `SELECT id, item_type, size, total_available, total_allocated, total_checked_in
       FROM merchandise_inventory
       WHERE event_id = $1
       ORDER BY item_type, size`,
      [event_id]
    );

    const counts = countResult.rows[0];
    res.json({
      event: eventResult.rows[0],
      registrations: {
        total: parseInt(counts.total) || 0,
        checked_in: parseInt(counts.checked_in) || 0,
        by_status: {
          registered: parseInt(counts.status_registered) || 0,
          confirmed: parseInt(counts.status_confirmed) || 0,
          cancelled: parseInt(counts.status_cancelled) || 0,
        }
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
      `SELECT *
       FROM registrations
       WHERE event_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [event_id, limit, offset]
    );

    const countResult = await req.app.locals.db.query(
      `SELECT COUNT(*) FROM registrations WHERE event_id = $1`,
      [event_id]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      registrations: result.rows,
      page,
      limit,
      total,
      hasMore: offset + limit < total
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/admin/events/:event_id/inventory - Merchandise inventory for event
router.get('/events/:event_id/inventory', async (req, res, next) => {
  try {
    const { event_id } = req.params;

    const result = await req.app.locals.db.query(
      `SELECT id, item_type, size, total_available, total_allocated, total_checked_in, notes
       FROM merchandise_inventory
       WHERE event_id = $1
       ORDER BY item_type, size`,
      [event_id]
    );

    res.json({ inventory: result.rows });

  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/events/:event_id/inventory/:item_id - Update inventory counts
router.patch('/events/:event_id/inventory/:item_id', async (req, res, next) => {
  try {
    const { event_id, item_id } = req.params;
    const { total_available, total_allocated, total_checked_in } = req.body;

    const sets = [];
    const values = [];
    let idx = 1;

    if (total_available !== undefined) {
      sets.push(`total_available = $${idx++}`);
      values.push(total_available);
    }
    if (total_allocated !== undefined) {
      sets.push(`total_allocated = $${idx++}`);
      values.push(total_allocated);
    }
    if (total_checked_in !== undefined) {
      sets.push(`total_checked_in = $${idx++}`);
      values.push(total_checked_in);
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    sets.push(`updated_at = NOW()`);
    values.push(item_id, event_id);

    const result = await req.app.locals.db.query(
      `UPDATE merchandise_inventory
       SET ${sets.join(', ')}
       WHERE id = $${idx++} AND event_id = $${idx}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json(result.rows[0]);

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
