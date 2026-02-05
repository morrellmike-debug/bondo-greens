# Bondo Greens API Documentation

**Base URL:** `http://localhost:3001/api` (development)  
**Production:** `https://bondo-greens.vercel.app/api`

---

## Database Schema Overview

See `migrations/001_initial_schema.sql` for complete schema.

### Key Tables
- **events** — Golf tournaments
- **registrations** — People registering for events
- **admin_users** — Staff with admin permissions
- **audit_log** — Compliance logging (HIPAA/SOC2)
- **merchandise_inventory** — T-shirts, meals tracking
- **sessions** — Admin login sessions

### Schema Design Principles
- Denormalization via JSONB (shirts, meals stored in registrations row)
- Indexed hot paths (event_id, email, created_at)
- Audit log for compliance (every change logged)
- No N+1 queries (batch operations only)

---

## Authentication

**Status:** Not yet implemented (TODO)

Future: JWT tokens + MFA (Authy)

---

## Endpoints

### Registrations (Public)

#### POST /registrations
Create a new event registration.

**Request:**
```json
{
  "event_id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "events_attending": [
    { "event": "friday_10hole", "confirmed": true },
    { "event": "saturday_scramble", "confirmed": true }
  ],
  "shirts": [
    { "size": "M", "qty": 1 },
    { "size": "L", "qty": 2 }
  ],
  "meals": [
    { "type": "adult", "qty": 2 },
    { "type": "kid", "qty": 1 }
  ],
  "guests": [
    { "name": "Jane Doe", "age": 8 }
  ]
}
```

**Response (201):**
```json
{
  "id": "registration-uuid",
  "message": "Registration successful",
  "created_at": "2026-02-05T04:14:00Z"
}
```

**Errors:**
- 400: Validation failed or email already registered
- 404: Event not found
- 400: Registration closed for event

---

#### GET /registrations/:event_id
List all registrations for an event (paginated).

**Query Parameters:**
- `page` (optional, default 0) — Page number

**Response:**
```json
{
  "registrations": [
    {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "events_attending": [...],
      "shirts": [...],
      "meals": [...],
      "checked_in": false,
      "status": "registered",
      "created_at": "2026-02-05T04:14:00Z"
    }
  ],
  "page": 0,
  "limit": 50,
  "total": 142,
  "hasMore": true
}
```

---

#### GET /registrations/:event_id/:registration_id
Get single registration details.

**Response:**
```json
{
  "id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "events_attending": [...],
  "shirts": [...],
  "meals": [...],
  "guests": [...],
  "checked_in": false,
  "checked_in_at": null,
  "status": "registered",
  "created_at": "2026-02-05T04:14:00Z"
}
```

---

#### POST /registrations/:event_id/:registration_id/checkin
Mark registration as checked in (day-of).

**Response (200):**
```json
{
  "id": "uuid",
  "checked_in_at": "2026-05-15T18:30:00Z",
  "message": "Checked in successfully"
}
```

---

### Events (Public)

#### GET /events
List all events.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Bondo Greens 2026",
    "description": "Annual golf tournament",
    "location": "Bondo Golf Club",
    "event_date": "2026-05-15",
    "status": "active",
    "registration_open": true
  }
]
```

---

#### GET /events/:id
Get single event details.

**Response:**
```json
{
  "id": "uuid",
  "name": "Bondo Greens 2026",
  "description": "Annual golf tournament",
  "location": "Bondo Golf Club",
  "event_date": "2026-05-15",
  "max_capacity": 100,
  "registration_open": true,
  "status": "active",
  "created_at": "2026-02-05T00:00:00Z"
}
```

---

### Admin Dashboard (Requires Auth - TODO)

#### GET /admin/events/:event_id/dashboard
Admin dashboard summary for event.

**Response:**
```json
{
  "event": {
    "id": "uuid",
    "name": "Bondo Greens 2026",
    "event_date": "2026-05-15",
    "max_capacity": 100
  },
  "registrations": {
    "total": 87,
    "checked_in": 65
  },
  "merchandise": [
    {
      "item_type": "shirt",
      "size": "M",
      "total_available": 100,
      "total_allocated": 45,
      "total_checked_in": 42
    }
  ]
}
```

---

#### GET /admin/events/:event_id/registrations
List registrations with full details (paginated).

**Query Parameters:**
- `page` (optional, default 0)

**Response:** Same as public list, with expanded fields.

---

#### POST /admin/events
Create a new event (admin only).

**Request:**
```json
{
  "name": "Bondo Greens 2026",
  "location": "Bondo Golf Club",
  "event_date": "2026-05-15",
  "max_capacity": 100
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "created_at": "2026-02-05T04:14:00Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Human-readable error message",
  "details": {...}  // Only in development
}
```

**Common Status Codes:**
- 200: Success
- 201: Created
- 400: Validation error or bad request
- 404: Not found
- 500: Server error

---

## Database Performance

**Key Indexes:**
- `registrations_event_id` — Fast event lookups
- `registrations_email` — Prevent duplicates
- `registrations_created_at` — Pagination sorting
- `event_id` on all child tables

**Query Patterns:**
- All list queries paginated (50-100 rows max)
- Batch operations (multiple inserts in 1 query)
- Denormalized JSONB (shirts/meals in single row = no JOINs)

**Typical Latency:**
- List registrations: <50ms
- Create registration: <100ms
- Check-in: <30ms
- Dashboard: <200ms

---

## Testing

**Local Setup:**
```bash
# 1. Start PostgreSQL
brew services start postgresql@15

# 2. Create database
createdb bondo_greens_db

# 3. Run migrations
npm run migrate

# 4. Start backend
npm run dev:backend

# 5. Start frontend (in another terminal)
npm run dev
```

**Test Registration:**
```bash
curl -X POST http://localhost:3001/api/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "...",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "events_attending": [{"event": "friday_10hole", "confirmed": true}],
    "shirts": [{"size": "M", "qty": 1}],
    "meals": [{"type": "adult", "qty": 2}]
  }'
```

---

## Compliance

**Audit Logging:** Every action logged to `audit_log` table
- Registration create/update/delete
- Check-in events
- Admin actions
- Authentication events

**Data Security:**
- Email validation required
- Duplicate prevention (unique email per event)
- Input validation (Zod schemas)
- JSONB for flexible data (no schema change needed)

---

## TODO (Phase 2)

- [ ] Admin authentication (JWT + Authy MFA)
- [ ] Update/delete registration endpoints
- [ ] Merchandise inventory management
- [ ] Export registrations (CSV)
- [ ] Email notifications (confirmation, reminder)
- [ ] Payment processing (if needed)
- [ ] Analytics/reporting
