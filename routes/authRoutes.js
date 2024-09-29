const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db/db');

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

const getRoleId =  (role) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM role WHERE role_name = ?', [role], (err, results) => {
            if (err) {
                return reject(err);
            }
            if (results.length > 0) {
                resolve(results[0].id);
            } else {
                resolve(null);
            }
        });
    });
};

// Register
router.post('/register', async (req, res) => {
    const { username, password, email, phoneNumber, role } = req.body;
    const role_id = await getRoleId(role);

    db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            const existingUser = results[0];
            const usernameTaken = existingUser.username === username;
            const emailTaken = existingUser.email === email;
            let msgErr = '';

            if (results.length === 2) {
                msgErr = 'Username and Email already taken';
            } else {
                if (usernameTaken) {
                    msgErr = 'Username already taken';
                } else if (emailTaken) {
                    msgErr = 'Email already taken';
                }
            }
            
            return res.status(400).json({ message: msgErr, icon: 'warning' });
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

            const sql = `INSERT INTO users (username, password, email, phone_number, role_id, created_at) 
                VALUES ('${username}', '${hashedPassword}', '${email}', '${phoneNumber}', ${role_id}, '${createdAt}')`;
            
            db.query(sql, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Database error' });
                }
                
                res.status(201).json({ message: 'User created successfully' });
            });
        }
    });
});

// Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], async (err, results) => {

        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role_id, restaurant: user.restaurant_id }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ token });
    });
});

module.exports = router;