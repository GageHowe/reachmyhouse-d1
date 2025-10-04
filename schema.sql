-- ==========================================
-- Users table
-- Stores identity and latest known location.
-- ==========================================
CREATE TABLE IF NOT EXISTS Users (
  phone_number TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  latitude REAL NOT NULL DEFAULT 0.0,   -- current location
  longitude REAL NOT NULL DEFAULT 0.0,  -- current location
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Groups table (rooms / venues)
-- ==========================================
CREATE TABLE IF NOT EXISTS Groups (
  group_id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_name TEXT NOT NULL
);

-- ==========================================
-- GroupMemberships table
-- Links users <-> groups (many-to-many),
-- tracks check-in location and departure status.
-- ==========================================
CREATE TABLE IF NOT EXISTS GroupMemberships (
  group_id INTEGER NOT NULL,
  phone_number TEXT NOT NULL,

  venue_lat REAL NOT NULL DEFAULT 0.0,  -- location where they checked in
  venue_lon REAL NOT NULL DEFAULT 0.0,
  has_left INTEGER NOT NULL DEFAULT 0,    -- 0=in room, 1=has left
  left_at DATETIME,                       -- timestamp when departure detected

  PRIMARY KEY (group_id, phone_number),
  FOREIGN KEY (group_id) REFERENCES Groups(group_id),
  FOREIGN KEY (phone_number) REFERENCES Users(phone_number)
);

-- ==========================================
-- Events table (general messaging / alerts)
-- Optional messaging record — same as before.
-- ==========================================
CREATE TABLE IF NOT EXISTS Events (
  event_id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES Groups(group_id),
  FOREIGN KEY (phone_number) REFERENCES Users(phone_number)
);