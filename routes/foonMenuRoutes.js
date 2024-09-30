const express = require('express');
const db = require('../db/db');
const multer  = require('multer');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.PATH_UPLOAD_IMAGE);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

router.get('/', async (req, res) => {

    db.query('SELECT * FROM food_menu', async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length > 0) {
            return res.status(200).json(results);
        }
   
    });
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM food_menu WHERE id = ?', [id], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length > 0) {
            return res.status(200).json(results);
        }
   
    });
});

router.get('/restaurant/:id', async (req, res) => {
    const restaurantId = req.params.id;
    
    db.query('SELECT * FROM food_menu WHERE restaurant_id = ?', [restaurantId], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length > 0) {
            return res.status(200).json(results);
        }
   
    });
});

//Add food menu
router.post('/add', upload.single('thumbnail'), (req, res) => {
    const { food_name, food_description, food_price, status, restaurant_id } = req.body;
    const food_picture = req.file.filename; 

    if (!food_name || !food_description || !food_picture || !food_price || !status || !restaurant_id) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = 'INSERT INTO food_menu (food_name, food_description, food_picture,food_price, status, restaurant_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)';

    db.query(query, [food_name, food_description, food_picture, food_price, status, restaurant_id, createdAt], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to add food item' });
        }

        res.status(200).json({ message: 'Food item added successfully' });

    });
  
});

//Update food menu
router.put('/update/:id', upload.single('thumbnail'), (req, res) => {
    const foodId = req.params.id;
    const { food_name, food_description, food_price, status } = req.body;
    const food_picture = req.file ? req.file.filename : null;

    if (!food_name || !food_description || !food_price || !status) {
        return res.status(400).json({ message: 'All fields are required' });
    }


    const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = 'UPDATE food_menu SET food_name = ?, food_description = ?, food_picture = ?, food_price = ?, status = ?, updated_at = ? WHERE id = ?';

    db.query(query, [food_name, food_description, food_picture, food_price, status, updatedAt, foodId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        return res.status(200).json({ message: 'Food item updated successfully' });

    });
});

//Delete food menu
router.delete('/delete/:id', (req, res) => {
    const foodId = req.params.id;
    
    db.query('SELECT * FROM food_menu WHERE id = ?', [foodId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        db.query('DELETE FROM food_menu WHERE id = ?', [foodId], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete food item' });
            }
            return res.status(200).json({ message: 'Food item deleted successfully' });
        });
    });
});



module.exports = router;