
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));
app.use(session({
    secret: 'mtk_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/mtk_classes',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Connect to PostgreSQL
pool.connect()
    .then(() => {
        console.log('Connected to PostgreSQL database');
        createTables();
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        // Continue without database for now
    });

function createTables() {
    // Users table
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            phone VARCHAR(20),
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Events/Classes table
    const createEventsTable = `
        CREATE TABLE IF NOT EXISTS events (
            id SERIAL PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            category VARCHAR(20) CHECK (category IN ('dancing', 'singing', 'acting', 'script_writing')) NOT NULL,
            date DATE NOT NULL,
            time TIME NOT NULL,
            duration VARCHAR(50),
            capacity INTEGER NOT NULL,
            registered_count INTEGER DEFAULT 0,
            amount DECIMAL(10,2) NOT NULL,
            instructor VARCHAR(100),
            location VARCHAR(200),
            age_group VARCHAR(50),
            skill_level VARCHAR(20) CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
            image_url VARCHAR(500),
            status VARCHAR(20) CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Registrations table
    const createRegistrationsTable = `
        CREATE TABLE IF NOT EXISTS registrations (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            event_id INTEGER NOT NULL,
            registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
            UNIQUE (user_id, event_id)
        )
    `;

    pool.query(createUsersTable)
        .then(() => console.log('Users table ready'))
        .catch(err => console.error('Error creating users table:', err));

    pool.query(createEventsTable)
        .then(() => console.log('Events table ready'))
        .catch(err => console.error('Error creating events table:', err));

    pool.query(createRegistrationsTable)
        .then(() => {
            console.log('Registrations table ready');
            createDefaultAdmin();
        })
        .catch(err => console.error('Error creating registrations table:', err));
}

function createDefaultAdmin() {
    const adminPassword = bcrypt.hashSync('admin123', 10);
    const checkAdmin = 'SELECT * FROM users WHERE username = $1';
    
    pool.query(checkAdmin, ['admin'])
        .then(result => {
            if (result.rows.length === 0) {
                const createAdmin = `
                    INSERT INTO users (username, email, password, full_name, is_admin) 
                    VALUES ($1, $2, $3, $4, $5)
                `;
                
                pool.query(createAdmin, ['admin', 'admin@mtk.com', adminPassword, 'Administrator', true])
                    .then(() => console.log('Default admin user created (username: admin, password: admin123)'))
                    .catch(err => console.error('Error creating admin user:', err));
            }
        })
        .catch(err => console.error('Error checking admin user:', err));
}

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
    const { username, email, password, full_name, phone } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password, full_name, phone) VALUES ($1, $2, $3, $4, $5)';
        
        await pool.query(query, [username, email, hashedPassword, full_name, phone]);
        res.json({ success: true, message: 'Registration successful' });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: 'Username or email already exists' });
        }
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const query = 'SELECT * FROM users WHERE username = $1 OR email = $1';
        const result = await pool.query(query, [username]);
        
        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }
        
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(400).json({ success: false, message: 'Invalid password' });
        }
        
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.isAdmin = user.is_admin;
        
        res.json({ 
            success: true, 
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                is_admin: user.is_admin
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user
app.get('/api/user', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    try {
        const query = 'SELECT id, username, email, full_name, is_admin FROM users WHERE id = $1';
        const result = await pool.query(query, [req.session.userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all events
app.get('/api/events', async (req, res) => {
    try {
        const query = `
            SELECT e.*, 
                   (e.capacity - e.registered_count) as available_slots
            FROM events e 
            WHERE e.status = 'upcoming' AND e.date >= CURRENT_DATE
            ORDER BY e.date ASC, e.time ASC
        `;
        
        const result = await pool.query(query);
        res.json({ success: true, events: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching events' });
    }
});

// Register for event
app.post('/api/register-event', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Please login first' });
    }
    
    const { event_id, notes } = req.body;
    const user_id = req.session.userId;
    
    try {
        // Check if event has available slots
        const checkSlots = 'SELECT capacity, registered_count FROM events WHERE id = $1';
        const eventResult = await pool.query(checkSlots, [event_id]);
        
        if (eventResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        const event = eventResult.rows[0];
        if (event.registered_count >= event.capacity) {
            return res.status(400).json({ success: false, message: 'No slots available' });
        }
        
        // Register user for event
        const registerQuery = 'INSERT INTO registrations (user_id, event_id, notes) VALUES ($1, $2, $3)';
        await pool.query(registerQuery, [user_id, event_id, notes]);
        
        // Update registered count
        const updateCount = 'UPDATE events SET registered_count = registered_count + 1 WHERE id = $1';
        await pool.query(updateCount, [event_id]);
        
        res.json({ success: true, message: 'Successfully registered for event' });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: 'Already registered for this event' });
        }
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// Admin middleware
function requireAdmin(req, res, next) {
    if (!req.session.userId || !req.session.isAdmin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
}

// Admin: Create event
app.post('/api/admin/events', requireAdmin, async (req, res) => {
    const {
        title, description, category, date, time, duration, capacity, 
        amount, instructor, location, age_group, skill_level, image_url
    } = req.body;
    
    try {
        const query = `
            INSERT INTO events (
                title, description, category, date, time, duration, capacity, 
                amount, instructor, location, age_group, skill_level, image_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id
        `;
        
        const values = [
            title, description, category, date, time, duration, capacity,
            amount, instructor, location, age_group, skill_level, image_url
        ];
        
        const result = await pool.query(query, values);
        res.json({ success: true, message: 'Event created successfully', eventId: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create event' });
    }
});

// Admin: Get all events
app.get('/api/admin/events', requireAdmin, async (req, res) => {
    try {
        const query = `
            SELECT e.*, 
                   (e.capacity - e.registered_count) as available_slots
            FROM events e 
            ORDER BY e.created_at DESC
        `;
        
        const result = await pool.query(query);
        res.json({ success: true, events: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching events' });
    }
});

// Admin: Get registrations for an event
app.get('/api/admin/events/:id/registrations', requireAdmin, async (req, res) => {
    try {
        const query = `
            SELECT r.*, u.full_name, u.email, u.phone
            FROM registrations r
            JOIN users u ON r.user_id = u.id
            WHERE r.event_id = $1
            ORDER BY r.registration_date DESC
        `;
        
        const result = await pool.query(query, [req.params.id]);
        res.json({ success: true, registrations: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching registrations' });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname, 'events.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
