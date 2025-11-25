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

    // Test connection and initialize tables asynchronously (don't block server startup)
    (async () => {
        try {
            const res = await pool.query('SELECT NOW()');
            console.log('Connected to PostgreSQL database:', res.rows[0]);
            
            // Create tables if they don't exist
            await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(50) DEFAULT 'user',
                    name VARCHAR(255) NOT NULL
                )
            `);
            
            await pool.query(`
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
            
            console.log('PostgreSQL tables created or already exist');
        } catch (err) {
            console.error('PostgreSQL initialization error:', err);
            // Don't throw - just log the error and continue
        }
    })();

    // Convert SQLite-style ? placeholders to PostgreSQL $1, $2, etc.
    const convertQuery = (text, params) => {
        let paramIndex = 1;
        const pgQuery = text.replace(/\?/g, () => `$${paramIndex++}`);
        return pgQuery;
    };

    db = {
        query: (text, params, callback) => {
            const pgQuery = convertQuery(text, params);
            return pool.query(pgQuery, params, callback);
        },
        get: (text, params, callback) => {
            // Handle both (query, callback) and (query, params, callback) patterns
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            const pgQuery = convertQuery(text, params);
            pool.query(pgQuery, params, (err, res) => {
                if (err) return callback(err);
                callback(null, res.rows[0]);
            });
        },
        all: (text, params, callback) => {
            // Handle both (query, callback) and (query, params, callback) patterns
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            const pgQuery = convertQuery(text, params);
            pool.query(pgQuery, params, (err, res) => {
                if (err) return callback(err);
                callback(null, res.rows);
            });
        },
        run: (text, params, callback) => {
            // Handle both (query, callback) and (query, params, callback) patterns
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            let pgQuery = convertQuery(text, params);
            
            // If it's an INSERT query without RETURNING, add RETURNING id
            if (pgQuery.trim().toUpperCase().startsWith('INSERT') && !pgQuery.toUpperCase().includes('RETURNING')) {
                pgQuery += ' RETURNING id';
            }
            
            pool.query(pgQuery, params, (err, res) => {
                if (callback) {
                    const context = {
                        lastID: res?.rows?.[0]?.id,
                        changes: res?.rowCount || 0
                    };
                    callback.call(context, err, res);
                }
            });
        }
    };
} else {
    // Use SQLite locally
    const path = require('path');
    const dbPath = path.join(__dirname, 'snack_requests.db');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the snack_requests database at:', dbPath);
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
