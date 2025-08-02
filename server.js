
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
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

// SQLite connection
const db = new sqlite3.Database('mtk_classes.db', (err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to SQLite database');
        createTables();
    }
});

function createTables() {
    // Users table
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            phone VARCHAR(20),
            is_admin BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Events/Classes table
    const createEventsTable = `
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            category VARCHAR(20) NOT NULL CHECK (category IN ('dancing', 'singing', 'acting', 'script_writing')),
            date DATE NOT NULL,
            time TIME NOT NULL,
            duration VARCHAR(50),
            capacity INTEGER NOT NULL,
            registered_count INTEGER DEFAULT 0,
            amount DECIMAL(10,2) NOT NULL,
            instructor VARCHAR(100),
            location VARCHAR(200),
            age_group VARCHAR(50),
            skill_level VARCHAR(20) DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
            image_url VARCHAR(500),
            status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Registrations table
    const createRegistrationsTable = `
        CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            event_id INTEGER NOT NULL,
            registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
            UNIQUE (user_id, event_id)
        )
    `;

    db.run(createUsersTable, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table ready');
        }
    });

    db.run(createEventsTable, (err) => {
        if (err) {
            console.error('Error creating events table:', err.message);
        } else {
            console.log('Events table ready');
        }
    });

    db.run(createRegistrationsTable, (err) => {
        if (err) {
            console.error('Error creating registrations table:', err.message);
        } else {
            console.log('Registrations table ready');
            createDefaultAdmin();
        }
    });
}

function createDefaultAdmin() {
    const adminPassword = bcrypt.hashSync('admin123', 10);
    const checkAdmin = 'SELECT * FROM users WHERE username = ?';
    
    db.get(checkAdmin, ['admin'], (err, row) => {
        if (err) {
            console.error('Error checking admin user:', err.message);
            return;
        }
        
        if (!row) {
            const createAdmin = `
                INSERT INTO users (username, email, password, full_name, is_admin) 
                VALUES (?, ?, ?, ?, ?)
            `;
            
            db.run(createAdmin, ['admin', 'admin@mtk.com', adminPassword, 'Administrator', 1], (err) => {
                if (err) {
                    console.error('Error creating admin user:', err.message);
                } else {
                    console.log('Default admin user created (username: admin, password: admin123)');
                    createSampleEvents();
                }
            });
        } else {
            createSampleEvents();
        }
    });
}

function createSampleEvents() {
    const checkEvents = 'SELECT COUNT(*) as count FROM events';
    
    db.get(checkEvents, [], (err, row) => {
        if (err || row.count > 0) return;
        
        const sampleEvents = [
            {
                title: 'Beginner Ballet Dancing',
                description: 'Learn the fundamentals of ballet dancing with our experienced instructors. Perfect for beginners aged 8-12.',
                category: 'dancing',
                date: '2024-02-15',
                time: '10:00',
                duration: '2 hours',
                capacity: 15,
                amount: 45.00,
                instructor: 'Sarah Johnson',
                location: 'Studio A',
                age_group: '8-12 years',
                skill_level: 'beginner'
            },
            {
                title: 'Vocal Training Workshop',
                description: 'Improve your singing voice with professional vocal training techniques and exercises.',
                category: 'singing',
                date: '2024-02-18',
                time: '14:00',
                duration: '1.5 hours',
                capacity: 12,
                amount: 35.00,
                instructor: 'Michael Stevens',
                location: 'Music Room',
                age_group: '10-16 years',
                skill_level: 'intermediate'
            },
            {
                title: 'Acting for Theatre',
                description: 'Develop your acting skills for stage performances with character development and scene work.',
                category: 'acting',
                date: '2024-02-20',
                time: '16:00',
                duration: '3 hours',
                capacity: 10,
                amount: 55.00,
                instructor: 'Emma Davis',
                location: 'Main Theatre',
                age_group: '12-18 years',
                skill_level: 'intermediate'
            },
            {
                title: 'Creative Script Writing',
                description: 'Learn the art of writing engaging scripts for theatre, film, and television.',
                category: 'script_writing',
                date: '2024-02-22',
                time: '11:00',
                duration: '2.5 hours',
                capacity: 8,
                amount: 40.00,
                instructor: 'David Wilson',
                location: 'Writing Lab',
                age_group: '14+ years',
                skill_level: 'beginner'
            },
            {
                title: 'Jazz Dance Intensive',
                description: 'High-energy jazz dance class focusing on technique, style, and performance.',
                category: 'dancing',
                date: '2024-02-25',
                time: '13:00',
                duration: '2 hours',
                capacity: 20,
                amount: 50.00,
                instructor: 'Lisa Rodriguez',
                location: 'Studio B',
                age_group: '13-17 years',
                skill_level: 'intermediate'
            }
        ];
        
        const insertEvent = `
            INSERT INTO events (
                title, description, category, date, time, duration, capacity, 
                amount, instructor, location, age_group, skill_level
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        sampleEvents.forEach(event => {
            db.run(insertEvent, [
                event.title, event.description, event.category, event.date, 
                event.time, event.duration, event.capacity, event.amount,
                event.instructor, event.location, event.age_group, event.skill_level
            ], (err) => {
                if (err) {
                    console.error('Error creating sample event:', err.message);
                }
            });
        });
        
        console.log('Sample events created successfully');
    });
}

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
    const { username, email, password, full_name, phone } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password, full_name, phone) VALUES (?, ?, ?, ?, ?)';
        
        db.run(query, [username, email, hashedPassword, full_name, phone], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ success: false, message: 'Username or email already exists' });
                }
                return res.status(500).json({ success: false, message: 'Registration failed' });
            }
            res.json({ success: true, message: 'Registration successful' });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
        
        db.get(query, [username, username], async (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Server error' });
            }
            
            if (!user) {
                return res.status(400).json({ success: false, message: 'User not found' });
            }
            
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
        const query = 'SELECT id, username, email, full_name, is_admin FROM users WHERE id = ?';
        
        db.get(query, [req.session.userId], (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Server error' });
            }
            
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            
            res.json({ success: true, user: user });
        });
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
            WHERE e.status = 'upcoming' AND e.date >= date('now')
            ORDER BY e.date ASC, e.time ASC
        `;
        
        db.all(query, [], (err, events) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error fetching events' });
            }
            res.json({ success: true, events: events });
        });
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
        const checkSlots = 'SELECT capacity, registered_count FROM events WHERE id = ?';
        
        db.get(checkSlots, [event_id], (err, event) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Registration failed' });
            }
            
            if (!event) {
                return res.status(404).json({ success: false, message: 'Event not found' });
            }
            
            if (event.registered_count >= event.capacity) {
                return res.status(400).json({ success: false, message: 'No slots available' });
            }
            
            // Register user for event
            const registerQuery = 'INSERT INTO registrations (user_id, event_id, notes) VALUES (?, ?, ?)';
            
            db.run(registerQuery, [user_id, event_id, notes], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ success: false, message: 'Already registered for this event' });
                    }
                    return res.status(500).json({ success: false, message: 'Registration failed' });
                }
                
                // Update registered count
                const updateCount = 'UPDATE events SET registered_count = registered_count + 1 WHERE id = ?';
                
                db.run(updateCount, [event_id], (err) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Registration failed' });
                    }
                    res.json({ success: true, message: 'Successfully registered for event' });
                });
            });
        });
    } catch (error) {
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            title, description, category, date, time, duration, capacity,
            amount, instructor, location, age_group, skill_level, image_url
        ];
        
        db.run(query, values, function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to create event' });
            }
            res.json({ success: true, message: 'Event created successfully', eventId: this.lastID });
        });
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
        
        db.all(query, [], (err, events) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error fetching events' });
            }
            res.json({ success: true, events: events });
        });
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
            WHERE r.event_id = ?
            ORDER BY r.registration_date DESC
        `;
        
        db.all(query, [req.params.id], (err, registrations) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error fetching registrations' });
            }
            res.json({ success: true, registrations: registrations });
        });
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
