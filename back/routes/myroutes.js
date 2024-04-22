const express = require("express");
const sequelize = require("../database");
// const {fs} = require('fs');
const { QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");

const router = express.Router();

router.delete("/users/:id/debannis", async (req, res) => {
  const { id } = req.params;

  console.log("Unbanning user:", id);

  try {
    await sequelize.query(`DELETE FROM userBannis WHERE id = ${id}`);
    res.send("User unbanned");
  } catch (error) {
    console.error("Error unbanning user:", error);
    res.status(500).send("Failed to unban user");
  }
});

router.delete("/users/:userType/:id", async (req, res) => {
  const { id } = req.params;
  const { userType } = req.params;

  console.log("Deleting user:", id, userType);

  try {
    await sequelize.query(`DELETE FROM ${userType} WHERE id = ${id}`);
    res.send("User deleted");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Failed to delete user");
  }
});

// Home route
router.get("/", (req, res) => {
  res.send("Home Page Route");
});

// About route
router.get("/about", (req, res) => {
  res.send("About Page Route");
});

// Portfolio route
router.get("/portfolio", (req, res) => {
  res.send("Portfolio Page Route");
});

// Services route
router.get("/services", (req, res) => {
  res.send("Services Page Route");
});

// GESTION DES UTILISATEURS
router.get("/users", async (req, res) => {
  const [voyageurs] = await sequelize.query("SELECT * FROM voyageurs");
  const [clientsBailleurs] = await sequelize.query(
    "SELECT * FROM clientsBailleurs"
  );
  const [prestataires] = await sequelize.query("SELECT * FROM prestataires");
  console.log(voyageurs);
  console.log(clientsBailleurs);
  console.log(prestataires);

  res.send({ voyageurs, clientsBailleurs, prestataires });
});

router.get("/users/:id/:type", async (req, res) => {
  console.log("route /users/:id called");
  const id = req.params.id;
  const type = req.params.type;
  console.log(type);
  const [users] = await sequelize.query(
    `SELECT * FROM ${type} WHERE id = ${id}`
  );
  console.log(users);
  console.log("APPELER");
  res.send(users[0]);
});

router.post("/users", async (req, res) => {
  console.log("Creating user:", req.body);
  const { nom, prenom, adresseMail, motDePasse, admin, dateDeNaissance, type } =
    req.body;

  try {
    const existingUser = await sequelize.query(
      `SELECT * FROM ${type} WHERE adresseMail = '${adresseMail}'`,
      { type: QueryTypes.SELECT }
    );
    if (existingUser.length > 0) {
      return res.status(409).send("Email already exists");
    }
    const bannedUser = await sequelize.query(
      `SELECT * FROM userBannis WHERE adresseMail = '${adresseMail}'`,
      { type: QueryTypes.SELECT }
    );
    if (bannedUser.length > 0) {
      return res.status(403).send("User is banned");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(motDePasse, 10); // 10 is the number of salt rounds

    // Insert the user data into the database
    await sequelize.query(
      `INSERT INTO ${type} (nom, prenom, adresseMail, motDePasse, admin, dateDeNaissance) VALUES ('${nom}', '${prenom}', '${adresseMail}', '${hashedPassword}', ${admin}, '${dateDeNaissance}')`
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send("Error creating user");
  }

  res.send();
});

module.exports = router;

router.put("/users/:id/:type", async (req, res) => {
  console.log("Modifying user:", req.body);
  const { id, type } = req.params;
  const { nom, prenom, adresseMail, motDePasse, dateDeNaissance } = req.body;
  console.log("date de naissance est :", dateDeNaissance);
  try {
    await sequelize.query(
      `UPDATE ${type} SET nom = '${nom}', prenom = '${prenom}', adresseMail = '${adresseMail}',dateDeNaissance = '${dateDeNaissance}', motDePasse = '${motDePasse}' WHERE id = ${id}`
    );
  } catch (error) {
    console.error("Error modifying user:", error);
  }
  res.send("User modified");
});

router.post("/users/bannir/vatefaireenculer/:id/:type", async (req, res) => {
  console.log("Modifying user:", req.body);
  console.log(req);
  const { id, type } = req.params;
  const { nom, prenom, adresseMail } = req.body;
  try {
    await sequelize.query(
      `INSERT INTO userBannis ( nom, prenom, adresseMail, dateBanissement) values ('${nom}', '${prenom}', '${adresseMail}', NOW());`
    );
    await sequelize.query(`DELETE FROM ${type} where id = ${id}`);
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).send("Error banning user");
  }
  res.send("User banned")
});

router.get("/users/bannis", async (req, res) => {
  try {
    const [bannedUsers] = await sequelize.query("SELECT * FROM userBannis");
    res.json(bannedUsers);
  } catch (error) {
    console.error("Error fetching banned users:", error);
    res.status(500).json({ error: "Failed to fetch banned users" });
  }
});

// GESTION DES BIENS/ANNONCES

router.get("/bienImo", async (req, res) => {
  const [bienImo] = await sequelize.query("SELECT * FROM bienImo");
  console.log(bienImo);
  res.send(bienImo);
});

router.delete("/bienImo/:id", async (req, res) => {
  const { id } = req.params;

  console.log("trying to delete bien:", id);

  try {
    await sequelize.query(`DELETE FROM bienImo WHERE id = ${id}`);
    res.send("Bien deleted");
  } catch (error) {
    console.error("Error deleting bien:", error);
    res.status(500).send("Failed to delete bien");
  }
});


router.post('/bienImo', async (req, res) => {
    console.log('Creating bien:', req.body);
    const { nomBien, description, id_ClientBailleur, prix, disponible, typeDePropriete,nombreChambres,nombreLits,nombreSallesDeBain,wifi,cuisine,balcon,jardin,parking,piscine,jaccuzzi,salleDeSport,climatisation} = req.body;
    newDescription = description.replace(/'/g, "''");
    try {
        await sequelize.query(`INSERT INTO bienImo (nomBien, description, id_ClientBailleur, statutValidation, prix, disponible, typeDePropriete,nombreChambres,nombreLits,nombreSallesDeBain,wifi,cuisine,balcon,jardin,parking,piscine,jaccuzzi,salleDeSport,climatisation) VALUES ('${nomBien}', '${newDescription}', '${id_ClientBailleur}', '0', '${prix}', '${disponible}', '${typeDePropriete}','${nombreChambres}','${nombreLits}','${nombreSallesDeBain}','${wifi}','${cuisine}','${balcon}','${jardin}','${parking}','${piscine}','${jaccuzzi}','${salleDeSport}','${climatisation}')`);
    }
    catch (error) {
        console.error('Error creating bien:', error);
    }
    res.send('Bien created');
});

router.get("/bienImo/:id", async (req, res) => {
  console.log("route /bienImo/:id called");
  const id = req.params.id;
  const [bien] = await sequelize.query(
    `SELECT * FROM bienImo WHERE id = ${id}`
  );
  console.log(bien);
  res.send(bien[0]);
});

router.put('/bienImo/:id', async (req, res) => {
    console.log('Modifying bien:', req.body);
    const { id } = req.params;
    const {nomBien, description, id_ClientBailleur, prix, disponible, typeDePropriete,nombreChambres,nombreLits,nombreSallesDeBain,wifi,cuisine,balcon,jardin,parking,piscine,jaccuzzi,salleDeSport,climatisation } = req.body;
    newDescription = description.replace(/'/g, "''");
    console.log('prix est :', prix);
    try {
        await sequelize.query(`UPDATE bienImo SET nomBien = '${nomBien}', description = '${newDescription}', id_ClientBailleur = '${id_ClientBailleur}', prix = '${prix}', disponible = '${disponible}', typeDePropriete = '${typeDePropriete}', nombreChambres = '${nombreChambres}', nombreLits = '${nombreLits}', nombreSallesDeBain = '${nombreSallesDeBain}', wifi = '${wifi}', cuisine = '${cuisine}', balcon = '${balcon}', jardin = '${jardin}', parking = '${parking}', piscine = '${piscine}', jaccuzzi = '${jaccuzzi}', salleDeSport = '${salleDeSport}', climatisation = '${climatisation}' WHERE id = ${id}`);
    }
    catch (error) {
        console.error('Error modifying bien:', error);
    }
    res.send('Bien modified');
});

router.post('/bienImo/filter', async (req, res) => {
    let { typeDePropriete, nombreChambres, nombreLits, nombreSallesDeBain, wifi, cuisine, balcon, jardin, parking, piscine, jaccuzzi, salleDeSport, climatisation } = req.body;

    // Convert boolean values to integers
    wifi = wifi ? 1 : 0;
    cuisine = cuisine ? 1 : 0;
    balcon = balcon ? 1 : 0;
    jardin = jardin ? 1 : 0;
    parking = parking ? 1 : 0;
    piscine = piscine ? 1 : 0;
    jaccuzzi = jaccuzzi ? 1 : 0;
    salleDeSport = salleDeSport ? 1 : 0;
    climatisation = climatisation ? 1 : 0;

    // Convert string values to integers
    nombreChambres = parseInt(nombreChambres);
    nombreLits = parseInt(nombreLits);
    nombreSallesDeBain = parseInt(nombreSallesDeBain);

    let query = 'SELECT * FROM bienImo';
    const params = [];

    const properties = { typeDePropriete, nombreChambres, nombreLits, nombreSallesDeBain, wifi, cuisine, balcon, jardin, parking, piscine, jaccuzzi, salleDeSport, climatisation };
    console.log(properties);
    for (const property in properties) {
        if (properties[property] !== undefined && properties[property] !== 'Tout') {
            if (params.length === 0) {
                query += ' WHERE';
            } else {
                query += ' AND';
            }

            query += ` ${property} = ?`;
            params.push(properties[property]);
        }
    }

    try {
        const result = await sequelize.query(query, { replacements: params, type: sequelize.QueryTypes.SELECT });
        console.log(result);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while filtering' });
    }
});

// GESTION DES RESERVATIONS

router.get("/reservation", async (req, res) => {
  const [reservation] = await sequelize.query("SELECT * FROM reservation");
  console.log(reservation);
  res.send(reservation);
});
