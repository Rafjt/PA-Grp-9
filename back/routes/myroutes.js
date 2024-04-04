const express = require('express');
const sequelize = require('../database');
// const {fs} = require('fs');

const router = express.Router();


router.delete('/users/:userType/:id', async (req, res) => {
    const {id} = req.params;
    const {userType} = req.params;

    console.log('Deleting user:', id, userType);

    try {
        await sequelize.query(`DELETE FROM ${userType} WHERE id = ${id}`);
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

// GESTION DES UTILISATEURS
router.get('/users', async (req, res) => {
    const [voyageurs] = await sequelize.query('SELECT * FROM voyageurs');
    const [clientsBailleurs] = await sequelize.query('SELECT * FROM clientsBailleurs');
    const [prestataires] = await sequelize.query('SELECT * FROM prestataires');
    console.log(voyageurs); 
    console.log(clientsBailleurs);
    console.log(prestataires);

    res.send({voyageurs, clientsBailleurs, prestataires});
});

router.get('/users/:id/:type', async (req, res) => {
    console.log('route /users/:id called');
    const id = req.params.id;
    const type = req.params.type;
    console.log(type);
    const [users] = await sequelize.query(`SELECT * FROM ${type} WHERE id = ${id}`);
    console.log(users);
    console.log("APPELER");
    res.send(users[0]);
}); 

router.post('/users', async (req, res) => {
    console.log('Creating user:', req.body);
    const { nom, prenom, adresseMail, motDePasse, admin, type } = req.body;
    try {
        await sequelize.query(`INSERT INTO ${type} (nom, prenom, adresseMail, motDePasse, admin) VALUES ('${nom}', '${prenom}', '${adresseMail}', '${motDePasse}', ${admin})`);
    }
    catch (error) {
        console.error('Error creating user:', error);
    }
    res.send('User created');
});

module.exports = router;


router.put('/users/:id/:type', async (req, res) => {
    console.log('Modifying user:', req.body);
    const { id, type } = req.params;
    const { nom, prenom, adresseMail, motDePasse,dateDeNaissance } = req.body;
    console.log('date de naissance est :', dateDeNaissance);
    try {
        await sequelize.query(`UPDATE ${type} SET nom = '${nom}', prenom = '${prenom}', adresseMail = '${adresseMail}',dateDeNaissance = '${dateDeNaissance}', motDePasse = '${motDePasse}' WHERE id = ${id}`);
    }
    catch (error) {
        console.error('Error modifying user:', error);
    }
    res.send('User modified');
});


// GESTION DES BIENS/ANNONCES

router.get('/bienimo', async (req, res) => {
    const [bienimo] = await sequelize.query('SELECT * FROM bienimo');
    console.log(bienimo);
    res.send(bienimo);
});

router.delete('/bienimo/:id', async (req, res) => {
    const {id} = req.params;

    console.log('trying to delete bien:', id);

    try {
        await sequelize.query(`DELETE FROM bienimo WHERE id = ${id}`);
        res.send('Bien deleted');
    } catch (error) {
        console.error('Error deleting bien:', error);
        res.status(500).send('Failed to delete bien');
    }
});


router.post('/bienimo', async (req, res) => {
    console.log('Creating bien:', req.body);
    const { nomBien, description, idClientBailleur } = req.body;
    try {
        await sequelize.query(`INSERT INTO bienimo (nomBien, description, idClientBailleur) VALUES ('${nomBien}', '${description}', ${idClientBailleur})`);
    }
    catch (error) {
        console.error('Error creating bien:', error);
    }
    res.send('Bien created');
});

router.get('/bienimo/:id', async (req, res) => {
    console.log('route /bienimo/:id called');
    const id = req.params.id;
    const [bien] = await sequelize.query(`SELECT * FROM bienimo WHERE id = ${id}`);
    console.log(bien);
    res.send(bien[0]);
});

router.put('/bienimo/:id', async (req, res) => {
    console.log('Modifying bien:', req.body);
    const { id } = req.params;
    const { nomBien, description, id_ClientBailleur, prix } = req.body;
    console.log('prix est :', prix);
    try {
        await sequelize.query(`UPDATE bienimo SET nomBien = '${nomBien}', description = '${description}', prix = '${prix}', id_ClientBailleur = ${id_ClientBailleur} WHERE id = ${id}`);
    }
    catch (error) {
        console.error('Error modifying bien:', error);
    }
    res.send('Bien modified');
});
