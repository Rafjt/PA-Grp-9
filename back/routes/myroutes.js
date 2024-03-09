const express = require('express');
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

module.exports = router;
