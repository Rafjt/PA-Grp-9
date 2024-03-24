const express = require('express');
const sequelize = require('../database');
const router = express.Router();


router.delete('/users/:userType/:id', async (req, res) => {
    const {id} = req.params;
    const {userType} = req.params;

    console.log('Deleting user:', id, userType);

    try {
        await sequelize.query(`DELETE FROM ${userType} WHERE ID = ${id}`);
        res.send('User deleted');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Failed to delete user');
    }
});

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
    const [voyageurs] = await sequelize.query('SELECT * FROM VOYAGEURS');
    const [clientsbailleurs] = await sequelize.query('SELECT * FROM CLIENTSBAILLEURS');
    const [prestataires] = await sequelize.query('SELECT * FROM PRESTATAIRES');
    console.log(voyageurs); 
    console.log(clientsbailleurs);
    console.log(prestataires);

    res.send({voyageurs, clientsbailleurs, prestataires});
});

router.post('/users', async (req, res) => {
    console.log('Creating user:', req.body);
    const { nom, prenom, adresseMail, motDePasse, admin, type } = req.body;
    try {
        await sequelize.query(`INSERT INTO ${type} (NOM, PRENOM, ADRESSEMAIL, MOTDEPASSE, ADMIN) VALUES ('${nom}', '${prenom}', '${adresseMail}', '${motDePasse}', ${admin})`);
    }
    catch (error) {
        console.error('Error creating user:', error);
    }
    res.send('User created');
});

module.exports = router;
