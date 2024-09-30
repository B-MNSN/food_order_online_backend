const express = require('express');
const db = require('../db/db');

const router = express.Router();

router.get('/', async (req, res) => {
    const search = req.query.search;

    if (search) {
        db.query('SELECT * FROM restaurants  WHERE restaurant_name LIKE ?', [`%${search}%`], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (results.length) {
                return res.status(200).json(results);
            } else {
                return res.status(200).json({message: 'No restaurant found', results});
            }
       
        });
    } else {
        db.query('SELECT * FROM restaurants', async (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (results.length > 0) {
                return res.status(200).json(results);
            }
       
        });
    }
});


module.exports = router;