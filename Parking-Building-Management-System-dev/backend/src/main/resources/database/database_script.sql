-- -----------------------------------------------------
-- TABLE: users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'staff', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- TABLE: floors (placeholder for layout configurations)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS floors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    floor_name TEXT NOT NULL UNIQUE,
    total_slots INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- TABLE: parking_slots
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS parking_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slot_code TEXT NOT NULL UNIQUE,
    floor_id INTEGER NOT NULL,
    slot_type TEXT NOT NULL DEFAULT 'CAR',
    status TEXT NOT NULL DEFAULT 'AVAILABLE',
    FOREIGN KEY(floor_id) REFERENCES floors(id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- TABLE: parking_sessions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS parking_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    license_plate TEXT NOT NULL,
    slot_id INTEGER NOT NULL,
    user_id INTEGER,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    FOREIGN KEY(slot_id) REFERENCES parking_slots(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- -----------------------------------------------------
-- TABLE: invoices
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PAID',
    FOREIGN KEY(session_id) REFERENCES parking_sessions(id)
);

-- -----------------------------------------------------
-- TABLE: pricing_policies
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS pricing_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_type TEXT NOT NULL UNIQUE,
    base_rate REAL NOT NULL,
    hourly_rate REAL NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- TABLE: exception_logs
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS exception_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    log_message TEXT NOT NULL,
    resolved TEXT NOT NULL DEFAULT 'NO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES parking_sessions(id)
);
