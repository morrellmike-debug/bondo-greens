/**
 * Registration Routes
 * Public API for event registration
 */

const express = require('express');
const { z } = require('zod');
const router = express.Router();

// Validation schemas
const registrationSchema = z.object({
  event_id: z.string().uuid(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  events_attending: z.array(z.object({
    event: z.string(),
    confirmed: z.boolean()
  })),
  shirts: z.array(z.object({
    size: z.string(),
    qty: z.number().min(0)
  })).default([]),
  meals: z.array(z.object({
    type: z.string(),
    qty: z.number().min(0)
  })).default([]),
  guests: z.array(z.object({
    name: z.string(),
    age: z.number().optional()
  })).default([])
});

// POST /api/registrations - Create new registration
router.post('/', async (req, res, next) => {
  try {
    // Validate input
    const data = registrationSchema.parse(req.body);

    // Check event exists and registration open
    const eventCheck = await req.app.locals.db.query(
      `SELECT id, registration_open FROM events WHERE id = $1`,
      [data.event_id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!eventCheck.rows[0].registration_open) {
      return res.status(400).json({ error: 'Registration is closed for this event' });
    }

    // Check for duplicate email+event
    const dupCheck = await req.app.locals.db.query(
      `SELECT id FROM registrations WHERE event_id = $1 AND email = $2`,
      [data.event_id, data.email]
    );

    if (dupCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered for this event' });
    }

    // Insert registration
    const result = await req.app.locals.db.query(
      `INSERT INTO registrations 
       (event_id, first_name, last_name, email, phone, events_attending, shirts, meals, guests)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, created_at`,
      [
        data.event_id,
        data.first_name,
        data.last_name,
        data.email,
        data.phone || null,
        JSON.stringify(data.events_attending),
        JSON.stringify(data.shirts),
        JSON.stringify(data.meals),
        JSON.stringify(data.guests)
      ]
    );

    // Log audit event (async, non-blocking)
    req.app.locals.auditLog?.push({
      event_id: data.event_id,
      action: 'registration.create',
      resource_type: 'registration',
      resource_id: result.rows[0].id,
      status: 'success'
    });

    res.status(201).json({
      id: result.rows[0].id,
      message: 'Registration successful',
      created_at: result.rows[0].created_at
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
});

// GET /api/registrations/:event_id - List registrations (with pagination)
router.get('/:event_id', async (req, res, next) => {
  try {
    const { event_id } = req.params;
    const page = parseInt(req.query.page) || 0;
    const limit = 50;
    const offset = page * limit;

    // Get registrations
    const result = await req.app.locals.db.query(
      `SELECT 
        id, first_name, last_name, email, phone,
        events_attending, shirts, meals, guests,
        checked_in, checked_in_at, status,
        created_at
       FROM registrations
       WHERE event_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [event_id, limit, offset]
    );

    // Get total count
    const countResult = await req.app.locals.db.query(
      `SELECT COUNT(*) FROM registrations WHERE event_id = $1`,
      [event_id]
    );

    res.json({
      registrations: result.rows,
      page,
      limit,
      total: parseInt(countResult.rows[0].count),
      hasMore: offset + limit < parseInt(countResult.rows[0].count)
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/registrations/:event_id/:registration_id - Get single registration
router.get('/:event_id/:registration_id', async (req, res, next) => {
  try {
    const { event_id, registration_id } = req.params;

    const result = await req.app.locals.db.query(
      `SELECT * FROM registrations WHERE id = $1 AND event_id = $2`,
      [registration_id, event_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    next(error);
  }
});

// POST /api/registrations/:event_id/:registration_id/checkin - Mark as checked in
router.post('/:event_id/:registration_id/checkin', async (req, res, next) => {
  try {
    const { event_id, registration_id } = req.params;

    const result = await req.app.locals.db.query(
      `UPDATE registrations 
       SET checked_in = true, checked_in_at = NOW()
       WHERE id = $1 AND event_id = $2
       RETURNING id, checked_in_at`,
      [registration_id, event_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Log audit
    req.app.locals.auditLog?.push({
      event_id,
      action: 'registration.checkin',
      resource_type: 'registration',
      resource_id: registration_id,
      status: 'success'
    });

    res.json({
      id: result.rows[0].id,
      checked_in_at: result.rows[0].checked_in_at,
      message: 'Checked in successfully'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
