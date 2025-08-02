
const express = require('express');
const mysql = require('mysql2');
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

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'mtk_user',
    password: 'password123',
    database: 'mtk_classes'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
    
    // Create tables if they don't exist
    createTables();
});

function createTables() {
    // Users table
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
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
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            category ENUM('dancing', 'singing', 'acting', 'script_writing') NOT NULL,
            date DATE NOT NULL,
            time TIME NOT NULL,
            duration VARCHAR(50),
            capacity INT NOT NULL,
            registered_count INT DEFAULT 0,
            amount DECIMAL(10,2) NOT NULL,
            instructor VARCHAR(100),
            location VARCHAR(200),
            age_group VARCHAR(50),
            skill_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
            image_url VARCHAR(500),
            status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Registrations table
    const createRegistrationsTable = `
        CREATE TABLE IF NOT EXISTS registrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            event_id INT NOT NULL,
            registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
            UNIQUE KEY unique_registration (user_id, event_id)
        )
    `;

    db.query(createUsersTable, (err) => {
        if (err) console.error('Error creating users table:', err);
        else console.log('Users table ready');
    });

    db.query(createEventsTable, (err) => {
        if (err) console.error('Error creating events table:', err);
        else console.log('Events table ready');
    });

    db.query(createRegistrationsTable, (err) => {
        if (err) console.error('Error creating registrations table:', err);
        else console.log('Registrations table ready');
        
        // Create default admin user
        createDefaultAdmin();
    });
}

function createDefaultAdmin() {
    const adminPassword = bcrypt.hashSync('admin123', 10);
    const checkAdmin = 'SELECT * FROM users WHERE username = "admin"';
    
    db.query(checkAdmin, (err, results) => {
        if (err) {
            console.error('Error checking admin user:', err);
            return;
        }
        
        if (results.length === 0) {
            const createAdmin = `
                INSERT INTO users (username, email, password, full_name, is_admin) 
                VALUES ('admin', 'admin@mtk.com', ?, 'Administrator', TRUE)
            `;
            
            db.query(createAdmin, [adminPassword], (err) => {
                if (err) console.error('Error creating admin user:', err);
                else console.log('Default admin user created (username: admin, password: admin123)');
            });
        }
    });
}

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
    const { username, email, password, full_name, phone } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password, full_name, phone) VALUES (?, ?, ?, ?, ?)';
        
        db.query(query, [username, email, hashedPassword, full_name, phone], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ success: false, message: 'Username or email already exists' });
                }
                return res.status(500).json({ success: false, message: 'Registration failed' });
            }
            
            res.json({ success: true, message: 'Registration successful' });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// User Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
    db.query(query, [username, username], async (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Server error' });
        }
        
        if (results.length === 0) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }
        
        const user = results[0];
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
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user
app.get('/api/user', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const query = 'SELECT id, username, email, full_name, is_admin FROM users WHERE id = ?';
    db.query(query, [req.session.userId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, user: results[0] });
    });
});

// Get all events
app.get('/api/events', (req, res) => {
    const query = `
        SELECT e.*, 
               (e.capacity - e.registered_count) as available_slots
        FROM events e 
        WHERE e.status = 'upcoming' AND e.date >= CURDATE()
        ORDER BY e.date ASC, e.time ASC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching events' });
        }
        
        res.json({ success: true, events: results });
    });
});

// Register for event
app.post('/api/register-event', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Please login first' });
    }
    
    const { event_id, notes } = req.body;
    const user_id = req.session.userId;
    
    // Check if event has available slots
    const checkSlots = 'SELECT capacity, registered_count FROM events WHERE id = ?';
    db.query(checkSlots, [event_id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        const event = results[0];
        if (event.registered_count >= event.capacity) {
            return res.status(400).json({ success: false, message: 'No slots available' });
        }
        
        // Register user for event
        const registerQuery = 'INSERT INTO registrations (user_id, event_id, notes) VALUES (?, ?, ?)';
        db.query(registerQuery, [user_id, event_id, notes], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ success: false, message: 'Already registered for this event' });
                }
                return res.status(500).json({ success: false, message: 'Registration failed' });
            }
            
            // Update registered count
            const updateCount = 'UPDATE events SET registered_count = registered_count + 1 WHERE id = ?';
            db.query(updateCount, [event_id], (err) => {
                if (err) {
                    console.error('Error updating registered count:', err);
                }
                
                res.json({ success: true, message: 'Successfully registered for event' });
            });
        });
    });
});

// Admin middleware
function requireAdmin(req, res, next) {
    if (!req.session.userId || !req.session.isAdmin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
}

// Admin: Create event
app.post('/api/admin/events', requireAdmin, (req, res) => {
    const {
        title, description, category, date, time, duration, capacity, 
        amount, instructor, location, age_group, skill_level, image_url
    } = req.body;
    
    const query = `
        INSERT INTO events (
            title, description, category, date, time, duration, capacity, 
            amount, instructor, location, age_group, skill_level, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        title, description, category, date, time, duration, capacity,
        amount, instructor, location, age_group, skill_level, image_url
    ];
    
    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Failed to create event' });
        }
        
        res.json({ success: true, message: 'Event created successfully', eventId: result.insertId });
    });
});

// Admin: Get all events
app.get('/api/admin/events', requireAdmin, (req, res) => {
    const query = `
        SELECT e.*, 
               (e.capacity - e.registered_count) as available_slots
        FROM events e 
        ORDER BY e.created_at DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching events' });
        }
        
        res.json({ success: true, events: results });
    });
});

// Admin: Get registrations for an event
app.get('/api/admin/events/:id/registrations', requireAdmin, (req, res) => {
    const query = `
        SELECT r.*, u.full_name, u.email, u.phone
        FROM registrations r
        JOIN users u ON r.user_id = u.id
        WHERE r.event_id = ?
        ORDER BY r.registration_date DESC
    `;
    
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching registrations' });
        }
        
        res.json({ success: true, registrations: results });
    });
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
