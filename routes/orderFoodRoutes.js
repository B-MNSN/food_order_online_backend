const express = require('express');
const db = require('../db/db');
const router = express.Router();


router.post('/add', (req, res) => {
    const { quantity, status, userId, restaurantId, foodMenuId } = req.body;

    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const checkQuery = 'SELECT * FROM food_order WHERE food_menu_id = ? AND user_id = ?';

    db.query(checkQuery, [foodMenuId, userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error while checking for duplicates' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Food menu item already exists in the cart' });
        }

        const query = 'INSERT INTO food_order (quantity, status, user_id, restaurant_id, food_menu_id, created_at) VALUES (?, ?, ?, ?, ?, ?)';

        db.query(query, [quantity, status, userId, restaurantId, foodMenuId, createdAt], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Failed to add order item' });
            }

            res.status(200).json({ message: 'Order item added successfully', orderId: results.insertId });
        });
    });
  
});

router.get('/orders', async (req, res) => {
    const id = req.query.userId;
    const status = req.query.status;
    const role = req.query.role;
    const restaurantId = req.query.restaurantId;

    // if (!id || !status) {
    //     return res.status(400).json({ error: 'User ID and status are required' });
    // }
    let query = '';
    if (role === 'admin' && restaurantId) {
        query = `
            SELECT fo.*, r.restaurant_name, fm.food_name, fm.food_price, u.username
            FROM food_order fo
            LEFT JOIN restaurants r ON fo.restaurant_id = r.id
            LEFT JOIN food_menu fm ON fo.food_menu_id = fm.id
            LEFT JOIN users u ON fo.user_id = u.id
            WHERE fo.restaurant_id = ? AND fo.status != ?
        `;
        db.query(query, [restaurantId, 'pending'], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            return res.status(200).json(results.length > 0 ? results : { message: 'No orders found' });
        });
    } else if (id && status) {
        query = `
            SELECT fo.*, r.restaurant_name, fm.food_name, fm.food_price 
            FROM food_order fo
            LEFT JOIN restaurants r ON fo.restaurant_id = r.id
            LEFT JOIN food_menu fm ON fo.food_menu_id = fm.id
            WHERE fo.user_id = ?
        `;

        if (status === 'all') {
            query += ' AND fo.status !="pending"';
        } else {
            query += ' AND fo.status = ?';
        }

        db.query(query, [id, status], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            return res.status(200).json(results.length > 0 ? results : { message: 'No orders found' });
        });
    } else {
        return res.status(400).json({ error: 'Invalid request parameters' });
    }
});

router.put('/updateStatus', (req, res) => {
    const { userId, restaurantId, status } = req.body;
    const role = req.query.role;
    let query = '';
    if (role) {
        query = `UPDATE food_order SET status = ? WHERE user_id = ? AND restaurant_id = ?`;
    } else {
        query = `UPDATE food_order SET status = ? WHERE user_id = ? AND restaurant_id = ? AND status = "pending"`;
    }

    db.query(query, [status, userId, restaurantId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        return res.status(200).json({ message: 'Order status updated successfully' });
    });
});


module.exports = router;