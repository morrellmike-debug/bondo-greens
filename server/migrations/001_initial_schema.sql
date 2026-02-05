-- Bondo Greens Golf Tournament - Database Schema
-- Date: Feb 5, 2026
-- Follows DATABASE-OPTIMIZATION.md patterns

-- EVENTS (Golf tournaments)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  event_date DATE NOT NULL,
  
  -- Capacity & tracking
  max_capacity INT,
  
  -- Registration config
  registration_open BOOLEAN DEFAULT true,
  registration_opens_at TIMESTAMPTZ,
  registration_closes_at TIMESTAMPTZ,
  
  -- Status
  status VARCHAR(50) DEFAULT 'scheduled',  -- scheduled, active, completed, cancelled
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  
  CONSTRAINT check_status CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled'))
);

CREATE INDEX events_status ON events(status);
CREATE INDEX events_event_date ON events(event_date DESC);

-- ADMIN USERS (Can manage events, check-in, view dashboard)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',  -- 'master', 'admin', 'volunteer'
  
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret VARCHAR(32),
  
  event_ids UUID[] DEFAULT ARRAY[]::UUID[],  -- Which events they manage
  
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT check_role CHECK (role IN ('master', 'admin', 'volunteer'))
);

CREATE INDEX admin_users_email ON admin_users(email);
CREATE INDEX admin_users_active ON admin_users(active);

-- REGISTRATIONS (People registering for event)
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  
  -- Personal info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  
  -- Event participation (JSONB for flexibility)
  events_attending JSONB DEFAULT '[]'::jsonb,  -- [{event: "friday_10hole", confirmed: true}]
  
  -- Merchandise (denormalized for efficiency)
  shirts JSONB DEFAULT '[]'::jsonb,  -- [{size: "M", qty: 1}, {size: "L", qty: 2}]
  meals JSONB DEFAULT '[]'::jsonb,   -- [{type: "adult", qty: 2}, {type: "kid", qty: 1}]
  
  -- Guests (if applicable)
  guests JSONB DEFAULT '[]'::jsonb,  -- [{name: "John", age: 5}, ...]
  
  -- Check-in status
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  
  -- Status
  status VARCHAR(50) DEFAULT 'registered',  -- registered, confirmed, cancelled
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT check_status CHECK (status IN ('registered', 'confirmed', 'cancelled'))
);

CREATE INDEX registrations_event_id ON registrations(event_id);
CREATE INDEX registrations_email ON registrations(email);
CREATE INDEX registrations_created_at ON registrations(created_at DESC);
CREATE INDEX registrations_checked_in ON registrations(checked_in);

-- AUDIT LOG (Compliance - HIPAA/SOC2 requirement)
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID,
  actor_id UUID,
  actor_ip INET,
  
  action VARCHAR(100) NOT NULL,  -- 'registration.create', 'checkin.mark', 'admin.login', etc.
  resource_type VARCHAR(100),    -- 'registration', 'event', etc.
  resource_id UUID,
  
  before_state JSONB,  -- Previous values (encrypted in app layer)
  after_state JSONB,   -- New values (encrypted in app layer)
  
  status VARCHAR(50) DEFAULT 'success',  -- success, failed
  error_msg VARCHAR(500),
  
  context JSONB,  -- device, location, user_agent, etc.
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
  CONSTRAINT fk_actor FOREIGN KEY (actor_id) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX audit_log_event_id ON audit_log(event_id, created_at DESC);
CREATE INDEX audit_log_action ON audit_log(action);
CREATE INDEX audit_log_actor_id ON audit_log(actor_id, created_at DESC);
CREATE INDEX audit_log_created_at ON audit_log(created_at DESC);

-- SESSIONS (For admin login)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  
  ip_address INET,
  user_agent VARCHAR(500),
  
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

CREATE INDEX sessions_admin_id ON sessions(admin_id);
CREATE INDEX sessions_token_hash ON sessions(token_hash);
CREATE INDEX sessions_expires_at ON sessions(expires_at);

-- MERCHANDISE INVENTORY (T-shirts, meals tracking)
CREATE TABLE merchandise_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  
  item_type VARCHAR(50) NOT NULL,  -- 'shirt', 'meal'
  size VARCHAR(50) NOT NULL,        -- 'S', 'M', 'L', 'adult', 'kid', etc.
  
  total_available INT,
  total_allocated INT DEFAULT 0,
  total_checked_in INT DEFAULT 0,
  
  notes VARCHAR(500),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT unique_item_per_event UNIQUE(event_id, item_type, size)
);

CREATE INDEX merchandise_inventory_event_id ON merchandise_inventory(event_id);

-- SUMMARY VIEWS (Materialized snapshots for dashboard)
CREATE TABLE event_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  
  total_registrations INT DEFAULT 0,
  total_checked_in INT DEFAULT 0,
  
  shirts JSONB,  -- {S: 5, M: 10, L: 8, ...}
  meals JSONB,   -- {adult: 25, kid: 10, ...}
  
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT unique_event_summary UNIQUE(event_id)
);

CREATE INDEX event_summary_event_id ON event_summary(event_id);

-- MATERIALIZED VIEW: For fast dashboard queries
CREATE MATERIALIZED VIEW registration_summary_by_event AS
SELECT 
  e.id as event_id,
  e.name as event_name,
  COUNT(r.id) as total_registrations,
  SUM(CASE WHEN r.checked_in THEN 1 ELSE 0 END) as checked_in_count,
  MAX(r.created_at) as last_registration
FROM events e
LEFT JOIN registrations r ON e.id = r.event_id
GROUP BY e.id, e.name;

CREATE INDEX idx_reg_summary_event_id ON registration_summary_by_event(event_id);
