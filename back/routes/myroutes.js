const express = require('express');
const sequelize = require('../database');
const router = express.Router();

// Home route
router.get('/', (req, res) => {
    res.send('Home Page Route');
});

// About route
router.get('/about', (req, res) => {
    res.send('About Page Route');
});

// Portfolio route
router.get('/portfolio', (req, res) => {
    res.send('Portfolio Page Route');
});

// Services route
router.get('/services', (req, res) => {
    res.send('Services Page Route');
});

// Users route
router.get('/users', async (req, res) => {
    const [users] = await sequelize.query('SELECT * FROM VOYAGEURS');
    console.log(users);
    res.send(users);
});
module.exports = router;
