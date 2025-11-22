const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();

// Check if we're on Heroku (DATABASE_URL exists)
const isProduction = process.env.DATABASE_URL !== undefined;

let db;

if (isProduction) {
    // Use PostgreSQL on Heroku
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    // Test connection
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('PostgreSQL connection error:', err);
        } else {
            console.log('Connected to PostgreSQL database:', res.rows[0]);
        }
    });

    // Create tables if they don't exist
    pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            name VARCHAR(255) NOT NULL
        )
    `).then(() => {
        return pool.query(`
            CREATE TABLE IF NOT EXISTS snack_requests (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                snack TEXT,
                drink TEXT,
                misc TEXT,
                link TEXT,
                ordered_flag INTEGER DEFAULT 0,
                created_at TIMESTAMP,
                ordered_at TIMESTAMP,
                keep_on_hand INTEGER DEFAULT 0
            )
        `);
    }).then(() => {
        console.log('Tables created or already exist');
    }).catch(err => {
        console.error('Error creating tables:', err);
    });

    db = {
        query: (text, params, callback) => {
            return pool.query(text, params, callback);
        },
        get: (text, params, callback) => {
            pool.query(text, params, (err, res) => {
                if (err) return callback(err);
                callback(null, res.rows[0]);
            });
        },
        all: (text, params, callback) => {
            pool.query(text, params, (err, res) => {
                if (err) return callback(err);
                callback(null, res.rows);
            });
        },
        run: (text, params, callback) => {
            pool.query(text, params, callback);
        }
    };
} else {
    // Use SQLite locally
    db = new sqlite3.Database('snack_requests.db', (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the snack_requests database.');
    });

    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user', 
                name TEXT NOT NULL
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS snack_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER, 
                snack TEXT,
                drink TEXT,
                misc TEXT,
                link TEXT,
                ordered_flag INTEGER DEFAULT 0,
                created_at TEXT,
                ordered_at TEXT,
                keep_on_hand INTEGER DEFAULT 0, 
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
    });
}

module.exports = { db, isProduction };
