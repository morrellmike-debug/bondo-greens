const express = require('express');
const router = express.Router();

// GET /api/events - List all events
router.get('/', async (req, res, next) => {
  try {
    const result = await req.app.locals.db.query(
      `SELECT id, name, description, location, event_date, status, registration_open
       FROM events
       ORDER BY
         CASE WHEN event_date >= CURRENT_DATE THEN 0 ELSE 1 END,
         event_date ASC`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req, res, next) => {
  try {
    const result = await req.app.locals.db.query(
      `SELECT * FROM events WHERE id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
