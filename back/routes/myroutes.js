const express = require('express');
const sequelize = require('../database');
// const {fs} = require('fs');
const { QueryTypes } = require('sequelize');

const router = express.Router();

router.get('/users/mean-age', async (req, res) => {
    try {
        // SQL query to calculate mean age
        const query = `
        SELECT AVG(age) AS mean_age FROM (
            SELECT TIMESTAMPDIFF(YEAR, dateDeNaissance, CURDATE()) AS age FROM voyageurs
            UNION ALL
            SELECT TIMESTAMPDIFF(YEAR, dateDeNaissance, CURDATE()) AS age FROM clientsBailleurs
            UNION ALL
            SELECT TIMESTAMPDIFF(YEAR, dateDeNaissance, CURDATE()) AS age FROM prestataires
        ) AS all_users;
        `;

        // Execute the query
        const [result] = await sequelize.query(query, { type: QueryTypes.SELECT });

        // Send the result as a response
        res.json(result);
    } catch (error) {
        console.error('Error fetching mean age:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



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

router.get('/users/count/:type', async (req, res) => {
    console.log('Route /count called');
    const type = req.params.type;
    try {
        const [result] = await sequelize.query(`SELECT COUNT(*) AS count FROM ${type}`);
        console.log(result);
        res.json({ count: result[0].count });
    } catch (error) {
        console.error('Error fetching user count:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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
    const { nom, prenom, adresseMail, motDePasse, admin, dateDeNaissance,type } = req.body;
    try {
        await sequelize.query(`INSERT INTO ${type} (nom, prenom, adresseMail, motDePasse, admin, dateDeNaissance) VALUES ('${nom}', '${prenom}', '${adresseMail}', '${motDePasse}', ${admin}, '${dateDeNaissance}')`);
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
    const { nom, prenom, adresseMail, motDePasse, dateDeNaissance } = req.body;
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

router.get('/bienImo', async (req, res) => {
    const [bienImo] = await sequelize.query('SELECT * FROM bienImo');
    console.log(bienImo);
    res.send(bienImo);
});

router.delete('/bienImo/:id', async (req, res) => {
    const {id} = req.params;

    console.log('trying to delete bien:', id);

    try {
        await sequelize.query(`DELETE FROM bienImo WHERE id = ${id}`);
        res.send('Bien deleted');
    } catch (error) {
        console.error('Error deleting bien:', error);
        res.status(500).send('Failed to delete bien');
    }
});


router.post('/bienImo', async (req, res) => {
    console.log('Creating bien:', req.body);
    const { nomBien, description, id_ClientBailleur, prix, disponible} = req.body;
    try {
        await sequelize.query(`INSERT INTO bienImo (nomBien, description, id_ClientBailleur, statutValidation, prix, disponible) VALUES ('${nomBien}', '${description}', '${id_ClientBailleur}', '0', '${prix}', '${disponible}')`);
    }
    catch (error) {
        console.error('Error creating bien:', error);
    }
    res.send('Bien created');
});

router.get('/bienImo/:id', async (req, res) => {
    console.log('route /bienImo/:id called');
    const id = req.params.id;
    const [bien] = await sequelize.query(`SELECT * FROM bienImo WHERE id = ${id}`);
    console.log(bien);
    res.send(bien[0]);
});

router.put('/bienImo/:id', async (req, res) => {
    console.log('Modifying bien:', req.body);
    const { id } = req.params;
    const { nomBien, description, id_ClientBailleur, prix, cheminImg } = req.body;
    newDescription = description.replace(/'/g, "''");
    console.log('prix est :', prix);
    try {
        await sequelize.query(`UPDATE bienImo SET nomBien = '${nomBien}', description = '${newDescription}', prix = '${prix}',cheminImg = '${cheminImg}', id_ClientBailleur = ${id_ClientBailleur} WHERE id = ${id}`);
    }
    catch (error) {
        console.error('Error modifying bien:', error);
    }
    res.send('Bien modified');
});


// GESTION DES RESERVATIONS

router.get('/reservation', async (req, res) => {
    const [reservation] = await sequelize.query('SELECT * FROM reservation');
    console.log(reservation);
    res.send(reservation);
}); 