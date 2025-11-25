const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // For password hashing
const { db, isProduction } = require('./db-config');

const app = express();
const port = process.env.PORT || 3000;

// Middleware - Simplified CORS to allow all origins
app.use(cors({
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Explicit handler for preflight OPTIONS requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(204);
});

app.use(bodyParser.json());

// Health check endpoint for Heroku
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Snackify Backend API is running' });
});

// Routes
// Registration Route
app.post('/api/register', async (req, res) => {
    try {
      const { username, password, role, name } = req.body;
      console.log("Received registration request:", req.body);  // Log the full request body
  
      // Check if username already exists (using await to ensure query completes)
      const existingUser = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
  
      console.log("Existing user query result:", existingUser); // Log the query result
  
      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' });
      }
  
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Insert user into the database
      db.run(
        'INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, role, name],
        function (err) { // Add callback for logging
          if (err) {
            console.error('Error inserting user:', err.message);
          } else {
            console.log('User registered successfully', this.lastID);
          }
          res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
        }
      );
  
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Registration failed' });
    }
  });
  
app.get('/api/requests', (req, res) => {
  db.all(`
  SELECT sr.*, u.name AS user_name
  FROM snack_requests sr
  JOIN users u ON sr.user_id = u.id
  ORDER BY
    CASE WHEN sr.ordered_flag = 1 THEN sr.ordered_at ELSE sr.created_at END DESC
  `, (err, rows) => {
    if (err) {
      console.error('Error fetching requests:', err.message);
      res.status(500).json({ error: 'Failed to fetch snack requests' });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/requests/user/:userId', (req, res) => {
  const userId = req.params.userId;

  db.all('SELECT * FROM snack_requests WHERE user_id = ? ORDER BY created_at desc', [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching user requests:', err.message);
      res.status(500).json({ error: 'Failed to fetch snack requests' });
    } else {
      res.json(rows);
    }
  });
});

  
app.post('/api/requests', async (req, res) => {
  try {
      const { user_id, snack, drink, misc, link } = req.body;
      console.log('Received snack request:', req.body);

        const isProduction = process.env.DATABASE_URL !== undefined;
        const dateSql = isProduction ? 'NOW()' : 'datetime("now", "localtime")';
        const result = await db.run(
        `INSERT INTO snack_requests (user_id, snack, drink, misc, link, created_at) VALUES (?, ?, ?, ?, ?, ${dateSql})`,
          [user_id, snack, drink, misc, link],
          function (err) {
            if (err) {
              console.error('Error creating request:', err.message);
              res.status(500).json({ error: 'Failed to create snack request' });
            } else {
              res.status(201).json({
                id: this.lastID, 
                user_id,
                snack, 
                drink, 
                misc, 
                link 
              });
            }
          }
        );
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to create snack request' });
  }
});


  app.put('/api/requests/:id/order', (req, res) => {
    const requestId = req.params.id;
    const newOrderedStatus = req.body.ordered ? 1 : 0; // Convert boolean to 1 or 0
  
    // Update the table column name
    const isProduction = process.env.DATABASE_URL !== undefined;
    const dateSql = isProduction ? 'NOW()' : 'datetime("now", "localtime")';
    db.run(`UPDATE snack_requests SET ordered_flag = ?, ordered_at = ${dateSql} WHERE id = ?`, [newOrderedStatus, requestId], function(err) {
      if (err) {
        console.error('Error updating request:', err.message);
        res.status(500).json({ error: 'Failed to update snack request' });
      } else {
        res.json({ message: 'Snack request updated successfully' });
      }
    });
  });

  app.put('/api/requests/:id/keep', (req, res) => {
    const requestId = req.params.id;
    const keepOnHand = req.body.keep_on_hand ? 1 : 0;
  
    db.run('UPDATE snack_requests SET keep_on_hand = ? WHERE id = ?', [keepOnHand, requestId], function(err) {
      if (err) {
        console.error('Error updating request:', err.message);
        res.status(500).json({ error: 'Failed to update snack request' });
      } else {
        res.json({ message: 'Snack request updated successfully' });
      }
    });
  });
  

  app.delete('/api/requests/:id', (req, res) => {
    const requestId = req.params.id;
  
    db.run('DELETE FROM snack_requests WHERE id = ?', [requestId], function(err) {
      if (err) {
        console.error('Error deleting request:', err.message);
        res.status(500).json({ error: 'Failed to delete snack request' });
      } else {
        res.json({ message: 'Snack request deleted successfully' });
      }
    });
  });
  
  

// Login Route (with async/await and password comparison)
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const row = await new Promise((resolve, reject) => { // Promisify db.get
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!row) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        const passwordMatch = await bcrypt.compare(password, row.password); 
        if (passwordMatch) {
            // Login successful - send relevant user data, excluding password
            res.json(row);
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// User Management Routes (Admin only)
// Get all users
app.get('/api/users', async (req, res) => {
    console.log('GET /api/users endpoint hit');
    try {
        const users = await new Promise((resolve, reject) => {
            console.log('Executing query: SELECT id, username, name, role FROM users ORDER BY name');
            db.all('SELECT id, username, name, role FROM users ORDER BY name', (err, rows) => {
                if (err) {
                    console.error('Query error:', err);
                    reject(err);
                } else {
                    console.log('Query returned rows:', rows);
                    resolve(rows);
                }
            });
        });
        console.log('Sending response with users:', users);
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Update user details (name, role)
app.put('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, role } = req.body;

        await new Promise((resolve, reject) => {
            db.run('UPDATE users SET name = ?, role = ? WHERE id = ?', [name, role, userId], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });

        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Error updating user:', err.message);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Reset user password (Admin only)
app.put('/api/users/:id/reset-password', async (req, res) => {
    try {
        const userId = req.params.id;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 4) {
            return res.status(400).json({ error: 'Password must be at least 4 characters' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await new Promise((resolve, reject) => {
            db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error('Error resetting password:', err.message);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // First delete all snack requests by this user
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM snack_requests WHERE user_id = ?', [userId], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });

        // Then delete the user
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err.message);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
