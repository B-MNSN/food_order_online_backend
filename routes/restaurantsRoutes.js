const express = require('express');
const db = require('../db/db');

const router = express.Router();

// Register
router.get('/', async (req, res) => {


    db.query('SELECT * FROM restaurants', async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length > 0) {
            return res.status(200).json(results);
        }
   
    });
});

module.exports = router;