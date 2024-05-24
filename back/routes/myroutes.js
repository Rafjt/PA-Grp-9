const express = require("express");
const sequelize = require("../database");
// const {fs} = require('fs');
// const path = require('path');
const { QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const multer = require('multer');
const router = express.Router();
const { exec } = require("child_process");
const mailRoute = require("./mailCode");
const { Console } = require("console");
router.use("/mail", mailRoute);
const { STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY } = require('../credsStripe.js');
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const URL = 'http://localhost:3000';

// stripe.products.list(
//   { limit: 10 },
//   function(err, products) {
//     // asynchronously called
//     if (err) {
//       console.error('Error fetching products:', err);
//     } else {
//       console.log('Fetched products:', products);
//     }
//   }
// );


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

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save uploaded files to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    // Extracting file extension
    const fileExtension = file.originalname.split('.').pop();
    // Getting the current timestamp
    const timestamp = Date.now();
    // Constructing the new filename
    const newFilename = `image.${timestamp}.${fileExtension}`;
    cb(null, newFilename); // Rename file with desired format
  },
});
const upload = multer({ storage: storage });
//


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
  const { id, userType } = req.params;

  console.log("Deleting user:", id, userType);

  try {
    if (userType === 'voyageurs') {
      // Delete all reservations of the user
      await sequelize.query(`DELETE FROM reservation WHERE id_ClientVoyageur = ${id}`);
    } else if (userType === 'clientsBailleurs') {
      // Delete all BienImo of the user
      await sequelize.query(`DELETE FROM bienImo WHERE id_ClientBailleur = ${id}`);
    }

    // Delete the user
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

router.get('/users/bailleurs', async (req, res) => {
  const [clientsBailleurs] = await sequelize.query('SELECT * FROM clientsBailleurs');
  res.send(clientsBailleurs);
});

router.get('/users/prestataires', async (req, res) => {
  const [prestataires] = await sequelize.query('SELECT * FROM prestataires');
  res.send(prestataires);
});

router.get('/users/voyageurs', async (req, res) => {
  const [voyageurs] = await sequelize.query('SELECT * FROM voyageurs');
  res.send(voyageurs);
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

router.post("/users/code/:code", async (req, res) => {
  const { code } = req.params;
  console.log("Verifying code...", code);

  try {
    // Check if the temporary table exists
    const tableExists = await sequelize.query(`SHOW TABLES LIKE '${code}'`, {
      type: QueryTypes.SELECT,
    });

    if (tableExists.length === 0) {
      return res.status(404).send("Table temporaire introuvable");
    } else {
      // Get data from the temporary table
      const tempTableData = await sequelize.query(`SELECT * FROM \`${code}\``, {
        type: QueryTypes.SELECT,
      });

      if (tempTableData.length === 0) {
        return res.status(404).send("La table temporaire est vide");
      }

      // Insert data into the permanent table using parameterized queries
      for (const row of tempTableData) {
        await sequelize.query(
          `INSERT INTO ${row.type} (nom, prenom, adresseMail, motDePasse, admin, dateDeNaissance) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          {
            replacements: [
              row.nom,
              row.prenom,
              row.adresseMail,
              row.motDePasse,
              row.admin,
              row.dateDeNaissance,
            ],
          }
        );
      }

      // Drop the temporary table
      await sequelize.query(`DROP TABLE \`${code}\``);
    }

    return res.status(200).send("User created successfully");
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send("Error creating user");
  }
});

router.put("/users/:id/:type", async (req, res) => {
  console.log("Modifying user:", req.body);
  const { id, type } = req.params;
  const { nom, prenom, adresseMail, motDePasse, dateDeNaissance, admin } = req.body;

  try {
    // Create an array to hold the fields and their corresponding values
    const fieldsToUpdate = {
      nom,
      prenom,
      adresseMail,
      dateDeNaissance,
      admin
    };

    // Conditionally include the password field in the update query
    if (motDePasse !== undefined) {
      const hashedPassword = await bcrypt.hash(motDePasse, 10); // Hash the password
      fieldsToUpdate.motDePasse = hashedPassword;
    }

    // Construct the SET clause and the values array for the prepared statement
    const setClause = Object.keys(fieldsToUpdate)
      .map(field => `${field} = ?`)
      .join(', ');
    const values = Object.values(fieldsToUpdate);
    values.push(id);

    // Perform the update operation using a parameterized query
    await sequelize.query(
      `UPDATE ${type} SET ${setClause} WHERE id = ?`,
      { replacements: values }
    );

    res.send("User modified");
  } catch (error) {
    console.error("Error modifying user:", error);
    res.status(500).send("An error occurred while modifying the user");
  }
});

router.post("/users/bannir/ausecours/:id/:type", async (req, res) => {
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
  res.send("User banned");
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

router.get("/users/infos", async (req, res) => {
  const { user } = req.session;
  try {
    const [userInfo] = await sequelize.query(`SELECT * FROM ${user.type} WHERE id = ${user.id}`);
    res.json(userInfo[0]);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "Failed to fetch user info" });
  }
});

router.get("/users/verifyValidationPresta", async (req, res) => {
  const { user } = req.session;
  let prestataire;

  try {
    [prestataire] = await sequelize.query(`SELECT * FROM prestataires WHERE id = ${user.id}`);
  } catch (error) {
    console.error("Error fetching prestataire:", error);
    return res.status(500).json({ error: "Failed to fetch prestataire" });
  }
  
  if (prestataire && prestataire.length > 0) {
    res.send(prestataire[0]);
  } else {
    res.status(404).json({ error: "Prestataire not found" });
  }
});

router.put("/users/:id/:type/:valide", async (req, res) => {
  const { id, type, valide } = req.params;
  try {
    await sequelize.query(
      `UPDATE ${type} SET valide = ${valide} WHERE id = ${id}`
    );
    res.send("User status updated");
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).send("Error updating user status");
  }
});

// GESTION DES BIENS/ANNONCES

router.get('/bienImo/count', async (req, res) => {
  console.log('Route /count called');
  try {
    const [result] = await sequelize.query('SELECT COUNT(*) AS count FROM bienImo');
    console.log(result);
    const count = result[0].count;
    res.json(count);
  } catch (error) {
    console.error('Error fetching bienImo count:', error);
    res.status(500).json({ error: 'Erreur interne serveur, appelez tout de suite la police' });
  }
});

router.get('/bienImo/prixMoy', async (req, res) => {
  try {
    const result = await sequelize.query(`
      SELECT AVG(prix) AS prixMoy FROM bienImo;
    `);
    const prixMoy = result[0][0].prixMoy; // Extracting the average price from the result
    res.json({ prixMoy });
  } catch (error) {
    console.error('Error fetching prixMoy:', error);
    res.status(500).json({ error: "L'ordinateur s'autodétruira dans 3 secondes" });
  }
});


router.get("/bienImo", async (req, res) => {
  const [bienImo] = await sequelize.query("SELECT * FROM bienImo");
  console.log(bienImo);
  res.send(bienImo);
});

router.delete('/bienImo/:id', async (req, res) => {
  const { id } = req.params;
  let cheminImg;
  try {
    const [[result]] = await sequelize.query(
      `SELECT cheminImg FROM bienImo WHERE id = ${id}`
    );
    cheminImg = result.cheminImg;
  } catch (error) {
    console.error('Error getting bien:', error);
    res.status(500).send('Failed to get bien');
    return;
  }

  console.log('cheminImg:', cheminImg);

  const command = `mv uploads/${cheminImg} todelete.jpg`;

  // rm ../uploads/${cheminImg}

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing the command: ${error}`);
      return;
    }

    console.log(`stdout: ${stdout}`);

    console.error(`stderr: ${stderr}`);
  });

  console.log('trying to delete bien:', id, 'with cheminImg:', cheminImg);

  try {
    await sequelize.query(`DELETE FROM reservation WHERE id_BienImmobilier = ${id}`);
  } catch (error) {
    console.error('Error deleting reservations:', error);
    res.status(500).send('Failed to delete reservations');
  }

  try {
    await sequelize.query(`DELETE FROM bienImo WHERE id = ${id}`);
    res.send("Bien deleted");
  } catch (error) {
    console.error("Error deleting bien:", error);
    res.status(500).send("Failed to delete bien");
  }
});

router.post('/bienImo', upload.single('pictures'), async (req, res) => {
  console.log('Creating bien:', req.body);
  console.log('Uploaded file:', req.file); // Log uploaded file information
  const {
    nomBien,
    description,
    id_ClientBailleur,
    prix,
    disponible,
    typeDePropriete,
    nombreChambres,
    nombreLits,
    nombreSallesDeBain,
    wifi,
    cuisine,
    balcon,
    jardin,
    parking,
    piscine,
    jaccuzzi,
    salleDeSport,
    climatisation,
    ville,
    adresse,
  } = req.body;
  
  const pictures = req.file.filename; // Get the filename of the uploaded image
  console.log('pictures ==', pictures); // Log uploaded file information

  try {
    const product = await stripe.products.create({
      name: nomBien,
      description: description,
    });

    // Create a Stripe price
    const stripePrice = await stripe.prices.create({
      unit_amount: prix * 100, // The price in cents
      currency: 'eur', // The currency of the price
      product: product.id, // The ID of the product this price is associated with
    });

    console.log('Stripe product created with ID:', product.id);
    console.log('Stripe price created with ID:', stripePrice.id);

    // Use a parameterized query to avoid SQL injection and handle special characters
    await sequelize.query(
      `INSERT INTO bienImo (
        nomBien, description, id_ClientBailleur, statutValidation, prix, disponible, typeDePropriete,
        nombreChambres, nombreLits, nombreSallesDeBain, wifi, cuisine, balcon, jardin, parking,
        piscine, jaccuzzi, salleDeSport, climatisation, cheminImg, ville, adresse, productId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          nomBien, description, id_ClientBailleur, 0, prix, disponible, typeDePropriete,
          nombreChambres, nombreLits, nombreSallesDeBain, wifi, cuisine, balcon, jardin, parking,
          piscine, jaccuzzi, salleDeSport, climatisation, pictures, ville, adresse, stripePrice.id
        ],
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.send('Bien created');
  } catch (error) {
    console.error('Error creating bien:', error);
    return res.status(500).send('Error creating bien');
  }
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

router.put('/bienImo/:id', upload.single('cheminImg'), async (req, res) => {
  console.log('Modifying bien:', req.body);
  const { id } = req.params;
  let pictures = req.body.cheminImg; // Use existing image by default
  let updateImageQuery = '';
  if (req.file) {
    pictures = req.file.filename; // If a new file was uploaded, use it instead
    updateImageQuery = `, cheminImg = '${pictures}'`;
  }
  console.log('pictures ==', pictures); // Log uploaded file information
  const {
    nomBien,
    description,
    id_ClientBailleur,
    prix,
    disponible,
    typeDePropriete,
    nombreChambres,
    nombreLits,
    nombreSallesDeBain,
    wifi,
    cuisine,
    balcon,
    jardin,
    parking,
    piscine,
    jaccuzzi,
    salleDeSport,
    climatisation,
    ville,
    adresse,
  } = req.body;

  // Escape single quotes in text fields to prevent SQL injection
  const newDescription = description.replace(/'/g, "''");
  const newNomBien = nomBien.replace(/'/g, "''");
  const newAdresse = adresse.replace(/'/g, "''");
  const newTypeDePropriete = typeDePropriete.replace(/'/g, "''");

  try {
    await sequelize.query(
      `UPDATE bienImo SET 
        nomBien = '${newNomBien}', 
        description = '${newDescription}', 
        id_ClientBailleur = '${id_ClientBailleur}', 
        prix = '${prix}', 
        disponible = '${disponible}', 
        typeDePropriete = '${newTypeDePropriete}', 
        nombreChambres = '${nombreChambres}', 
        nombreLits = '${nombreLits}', 
        nombreSallesDeBain = '${nombreSallesDeBain}', 
        wifi = '${wifi}', 
        cuisine = '${cuisine}', 
        balcon = '${balcon}', 
        jardin = '${jardin}', 
        parking = '${parking}', 
        piscine = '${piscine}', 
        jaccuzzi = '${jaccuzzi}', 
        salleDeSport = '${salleDeSport}', 
        climatisation = '${climatisation}', 
        ville = '${ville}', 
        adresse = '${newAdresse}'
        ${updateImageQuery} 
      WHERE id = ${id}`
    );
    res.send('Bien modified');
  } catch (error) {
    console.error('Error modifying bien:', error);
    res.status(500).send('Error modifying bien');
  }
});
router.post('/bienImo/filter', async (req, res) => {
  let {
    typeDePropriete,
    nombreChambres,
    nombreLits,
    nombreSallesDeBain,
    wifi,
    cuisine,
    balcon,
    jardin,
    parking,
    piscine,
    jaccuzzi,
    salleDeSport,
    climatisation,
    prixMin,
    prixMax,
    ville,
  } = req.body;

  wifi = wifi ? 1 : 0;
  cuisine = cuisine ? 1 : 0;
  balcon = balcon ? 1 : 0;
  jardin = jardin ? 1 : 0;
  parking = parking ? 1 : 0;
  piscine = piscine ? 1 : 0;
  jaccuzzi = jaccuzzi ? 1 : 0;
  salleDeSport = salleDeSport ? 1 : 0;
  climatisation = climatisation ? 1 : 0;

  nombreChambres =
    nombreChambres !== 'Tout' ? parseInt(nombreChambres) : nombreChambres;
  nombreLits = nombreLits !== 'Tout' ? parseInt(nombreLits) : nombreLits;
  nombreSallesDeBain =
    nombreSallesDeBain !== 'Tout'
      ? parseInt(nombreSallesDeBain)
      : nombreSallesDeBain;
  ville = ville !== 'Tout' ? ville : ville;

  let query = 'SELECT * FROM bienImo';
  const params = [];

  const properties = {
    typeDePropriete,
    nombreChambres,
    nombreLits,
    nombreSallesDeBain,
    wifi,
    cuisine,
    balcon,
    jardin,
    parking,
    piscine,
    jaccuzzi,
    salleDeSport,
    climatisation,
    ville,
  };
  console.log(properties);
  for (const property in properties) {
    if (
      properties[property] !== undefined &&
      properties[property] !== 'Tout' &&
      properties[property] !== 0
    ) {
      if (params.length === 0) {
        query += ' WHERE';
      } else {
        query += ' AND';
      }

      query += ` ${property} = ?`;
      params.push(properties[property]);
    }
  }

  // Add price range filter
  if (prixMin) {
    if (params.length === 0) {
      query += ' WHERE';
    } else {
      query += ' AND';
    }

    query += ' prix >= ?';
    params.push(prixMin);
  }

  if (prixMax) {
    if (params.length === 0) {
      query += ' WHERE';
    } else {
      query += ' AND';
    }

    query += ' prix <= ?';
    params.push(prixMax);
  }

  try {
    const result = await sequelize.query(query, {
      replacements: params,
      type: sequelize.QueryTypes.SELECT,
    });
    console.log(result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while filtering' });
  }
});

router.get('/biens', async (req, res) => {
  const { user } = req.session;
  const [bienImo] = await sequelize.query(`SELECT * FROM bienImo WHERE id_ClientBailleur = ${user.id}`);
  res.send(bienImo);
});

// GESTION DES RESERVATIONS

router.get('/MyCalendar', async (req, res) => {
  const { user } = req.session;
  try {
    // Fetch all bienImo associated with the user
    const [bienImos] = await sequelize.query(`SELECT * FROM bienImo WHERE id_ClientBailleur = ${user.id}`);

    // Extract the ids of the bienImos
    const bienImoIds = bienImos.map(bienImo => bienImo.id);

    // Fetch all reservations associated with these bienImo
    const [reservations] = await sequelize.query(`SELECT * FROM reservation WHERE id_BienImmobilier IN (${bienImoIds.join(',')})`);

    res.json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching reservations.' });
  }
});


router.get('/reservation', async (req, res) => {
  const [reservation] = await sequelize.query('SELECT * FROM reservation');
  console.log(reservation);
  res.send(reservation);
}); 

router.delete('/reservation/:id', async (req, res) => {
  const {id} = req.params;

  console.log('trying to delete bien:', id);

  try {
      await sequelize.query(`DELETE FROM reservation WHERE id = ${id}`);
      res.send('Reservation deleted');
  } catch (error) {
      console.error('Error deleting reservation:', error);
      res.status(500).send('Failed to delete reservation');
  }
});

router.get('/reservation/:id', async (req, res) => {
  console.log('route /reservation/:id called');
  const id = req.params.id;
  const [reservation] = await sequelize.query(`SELECT * FROM reservation WHERE id = ${id}`);
  console.log(reservation);
  res.send(reservation[0]);
});

router.get('/reservation/:id/dates', async (req, res) => {
  const id = req.params.id;
  console.log('route /reservation/:id/dates called with id:', id);
  const [reservation] = await sequelize.query(`SELECT dateDebut, dateFin FROM reservation WHERE id_BienImmobilier = ${id}`);
  res.send(JSON.stringify(reservation));
  console.log(reservation);
});

router.post('/reservation', async (req, res) => {
  const { id_BienImmobilier, id_Voyageur, dateDebut, dateFin, prixTotal } = req.body;
  console.log('Creating reservation:', req.body);

  let nomBien;
  try {
    const result = await sequelize.query(
      'SELECT nomBien FROM bienImo WHERE id = ?',
      {
        replacements: [id_BienImmobilier],
        type: sequelize.QueryTypes.SELECT
      }
    );
    if (result.length === 0) {
      return res.status(404).send('Bien not found');
    }
    nomBien = result[0].nomBien; // Extract nomBien from the result set
  } catch (error) {
    console.error('Error fetching bien:', error);
    return res.status(500).send('Failed to fetch bien');
  }

  try {
    await sequelize.query(
      'INSERT INTO reservation (id_BienImmobilier, id_ClientVoyageur, dateDebut, dateFin, prix, nomBien) VALUES (?, ?, ?, ?, ?, ?)',
      {
        replacements: [id_BienImmobilier, id_Voyageur, dateDebut, dateFin, prixTotal, nomBien],
        type: sequelize.QueryTypes.INSERT
      }
    );
  } catch (error) {
    console.error('Error creating reservation:', error);
    return res.status(500).send('Error creating reservation');
  }

  res.send('Reservation created');
});

/*
router.put("/reservation/:id", async (req, res) => {
  console.log("Modifying reservation :", req.body);
  const { id } = req.params;
  const {
    dateDebut,
    dateFin,
    statut,
  } = req.body;

  try {
    await sequelize.query(
      `UPDATE reservation SET dateDebut = '${dateDebut}', dateFin = '${dateFin}', statut = '${statut}' WHERE id = ${id}`
    );
  } catch (error) {
    console.error("Error modifying reservation :", error);
  }

  res.send("Reservation successfully updated");
});

*/

router.put('/reservation/:id', async (req, res) => {
  const { id } = req.params;
  const { dateDebut, dateFin } = req.body;

  try {
      await sequelize.query(`
          UPDATE reservation SET
          dateDebut = ${dateDebut},
          dateFin = ${dateFin}
          WHERE id = ${id}
      `, {
          replacements: {
              id,
              dateDebut,
              dateFin,
          }
      });
      res.json({ success: true, message: 'Reservation updated successfully' });
  } catch (error) {
      console.error('Failed to update reservation', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get("/reservation/:idVoyageur/voyageur", async (req, res) => {
  console.log("route /reservation/:idVoyageur/voyageur called");
  const idVoyageur = req.params.idVoyageur;
  try {
    const reservations = await sequelize.query(`
      SELECT r.*, bi.*, cb.nom as bailleurNom, cb.prenom as bailleurPrenom, cb.adresseMail as bailleurMail
      FROM reservation r
      JOIN bienImo bi ON r.id_BienImmobilier = bi.id 
      JOIN clientsBailleurs cb on bi.id_ClientBailleur = cb.id
      WHERE id_ClientVoyageur = ${idVoyageur}
    `);
    console.log(reservations);
    res.send(reservations[0]); // Return the array of reservations
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).send("Internal server error");
  }
});



// GESTION DES PAIEMENTS

router.get("/paiement", async (req, res) => {
  const [paiement] = await sequelize.query("SELECT * FROM paiement");
  console.log(paiement);
  res.send(paiement);
});

router.delete("/paiement/:id", async (req, res) => {
  const { id } = req.params;

  console.log("Deleting paiement:", id);

  try {
    await sequelize.query(`DELETE FROM paiement WHERE id = ${id}`);
    res.send("Paiement deleted");
  } catch (error) {
    console.error("Error deleting paiement:", error);
    res.status(500).send("Failed to delete paiement");
  }
});

router.put("/paiement/:id/validate", async (req, res) => {
  const { id } = req.params;

  console.log("Validating paiement:", id);

  try {
    await sequelize.query(
      `UPDATE paiement SET statut = 'Validé' WHERE id = ${id}`
    );
    res.send("Paiement validated");
  } catch (error) {
    console.error("Error validating paiement:", error);
    res.status(500).send("Failed to validate paiement");
  }
});

// router.put("/paiement/:id/pending", async (req, res) => {
//   const { id } = req.params;

//   console.log("Pending paiement:", id);

//   try {
//     await sequelize.query(`UPDATE paiement SET statut = 'En attente' WHERE id = ${id}`);
//     res.send("Paiement pending");
//   }
//   catch (error) {
//     console.error("Error pending paiement:", error);
//     res.status(500).send("Failed to pending paiement");
//   }
// });

router.post("/paiement", async (req, res) => {
  console.log("Creating paiement:", req.body);
  let { idReservation, nom, datePaiement, methodePaiement, montant, statut } =
    req.body;

  // If statut is empty, set it to "En attente"
  if (!statut) {
    statut = 'En attente';
  }

  try {
    await sequelize.query(
      `INSERT INTO paiement (id_Reservation, nom, datePaiement, methodePaiement, montant, statut) VALUES ('${idReservation}', '${nom}', '${datePaiement}', '${methodePaiement}', '${montant}', '${statut}')`
    );
  } catch (error) {
    console.error("Error creating paiement:", error);
    return res.status(500).send("Error creating paiement");
  }

  res.send("Paiement created");
});

router.put("/paiement/:id", async (req, res) => {
  console.log("Modifying paiement:", req.body);
  const { id } = req.params;
  const {
    id_Reservation,
    nom,
    datePaiement,
    methodePaiement,
    montant,
    statut,
  } = req.body;

  try {
    await sequelize.query(
      `UPDATE paiement SET id_Reservation = '${id_Reservation}', nom = '${nom}', datePaiement = '${datePaiement}', methodePaiement = '${methodePaiement}', montant = '${montant}', statut = '${statut}' WHERE id = ${id}`
    );
  } catch (error) {
    console.error("Error modifying paiement:", error);
  }

  res.send("Paiement modified");
});


// GESTION DES REQUETES UTILISATEURS

router.post("/bienDispo", async (req, res) => {
  console.log("route /bienDispo called");
  const { ville, arrivee, depart, typeDePropriete, nombreChambres, nombreLits, nombreSallesDeBain,
    prixMin, prixMax, wifi, cuisine, balcon, jardin, parking, piscine, jaccuzzi, salleDeSport, climatisation } = req.body;
  let query = `SELECT bienImo.id, cheminImg, ville, adresse, prix, nomBien, description, statutValidation, disponible, typeDePropriete,
  nombreChambres, nombreLits, nombreSallesDeBain, wifi, cuisine, balcon, jardin, parking, piscine, jaccuzzi,
  salleDeSport, climatisation, clientsBailleurs.nom, clientsBailleurs.prenom
  FROM bienImo
  JOIN clientsBailleurs ON bienImo.Id_ClientBailleur = clientsBailleurs.id
  WHERE disponible = 1
  AND bienImo.id NOT IN (
      SELECT id_BienImmobilier
      FROM reservation
      WHERE dateDebut <= '${arrivee}' AND dateFin >= '${depart}'
  )`;

  if (ville) {
    query += ` AND ville = '${ville}'`;
  }
  if (typeDePropriete) {
    query += ` AND typeDePropriete = '${typeDePropriete}'`;
  }
  if (nombreChambres) {
    query += ` AND nombreChambres = ${nombreChambres}`;
  }
  if (nombreLits) {
    query += ` AND nombreLits = ${nombreLits}`;
  }
  if (nombreSallesDeBain) {
    query += ` AND nombreSallesDeBain = ${nombreSallesDeBain}`;
  }
  if (prixMin) {
    query += ` AND prix >= ${prixMin}`;
  }
  if (prixMax) {
    query += ` AND prix <= ${prixMax}`;
  }
  if (wifi) {
    query += ` AND wifi = ${wifi}`;
  }
  if (cuisine) {
    query += ` AND cuisine = ${cuisine}`;
  }
  if (balcon) {
    query += ` AND balcon = ${balcon}`;
  }
  if (jardin) {
    query += ` AND jardin = ${jardin}`;
  }
  if (parking) {
    query += ` AND parking = ${parking}`;
  }
  if (piscine) {
    query += ` AND piscine = ${piscine}`;
  }
  if (jaccuzzi) {
    query += ` AND jaccuzzi = ${jaccuzzi}`;
  }
  if (salleDeSport) {
    query += ` AND salleDeSport = ${salleDeSport}`;
  }
  if (climatisation) {
    query += ` AND climatisation = ${climatisation}`;
  }

  const [bienDispo] = await sequelize.query(query);
  console.log(bienDispo);
  res.send(bienDispo);
});

module.exports = router;



// GESTION DES PRESTATIONS

router.get('/prestationsById', async (req, res) => {
  const { user } = req.session;
  let query = '';

  switch(user.type) {
    case 'clientsBailleurs':
      query = `
        SELECT prestation.*, bienImo.nomBien,
               CASE 
                   WHEN EXISTS (SELECT 1 
                                FROM evaluationPrestation ep 
                                WHERE ep.id_Prestation = prestation.id) 
                   THEN 1 
                   ELSE 0 
               END as evalExists
        FROM prestation 
        INNER JOIN bienImo ON prestation.id_BienImmobilier = bienImo.id 
        WHERE prestation.id_clientBailleur = ${user.id} 
          AND prestation.statut != 'TERMINEE'`;
      break;
  
    case 'voyageurs':
      query = `
        SELECT prestation.*,
               CASE 
                   WHEN EXISTS (SELECT 1 
                                FROM evaluationPrestation ep 
                                WHERE ep.id_Prestation = prestation.id) 
                   THEN 1 
                   ELSE 0 
               END as evalExists
        FROM prestation 
        WHERE id_Voyageur = ${user.id} 
          AND statut != 'TERMINEE'`;
      break;
  
    case 'prestataires':
      query = `
        SELECT prestation.*,
               CASE 
                   WHEN EXISTS (SELECT 1 
                                FROM evaluationPrestation ep 
                                WHERE ep.id_Prestation = prestation.id) 
                   THEN 1 
                   ELSE 0 
               END as evalExists
        FROM prestation 
        WHERE id_Prestataire = ${user.id}`;
      break;
  
    default:
      res.status(400).send({ error: 'Invalid user type' });
      return;
  }

  const [prestations] = await sequelize.query(query);
  res.send(prestations);
});

router.get('/prestationsByIdPrestation', async (req, res) => {
  const { idPrestation } = req.query; // Use req.query to get query parameters

  try {
    // Fetch the prestation to determine the type of user
    const [prestation] = await sequelize.query(
      'SELECT * FROM prestation WHERE id = :idPrestation',
      {
        replacements: { idPrestation },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!prestation) {
      return res.status(404).send('Prestation not found');
    }

    // Determine the type of user and construct the appropriate query
    let query = '';
    let replacements = { idPrestation };

    if (prestation.id_ClientBailleur) {
      query = `SELECT pst.*, cb.nom as demandeurNom, cb.prenom as demandeurPrenom, prst.nom as prestataireNom, prst.prenom as prestatairePrenom
               FROM prestation pst
               JOIN clientsBailleurs cb on pst.id_ClientBailleur = cb.id
               JOIN prestataires prst on pst.id_Prestataire = prst.id
               WHERE pst.id = :idPrestation`;
    } else if (prestation.id_Voyageur) {
      query = `SELECT pst.*, v.nom as demandeurNom, v.prenom as demandeurPrenom, prst.nom as prestataireNom, prst.prenom as prestatairePrenom
               FROM prestation pst
               JOIN voyageurs v on pst.id_Voyageur = v.id
               JOIN prestataires prst on pst.id_Prestataire = prst.id
               WHERE pst.id = :idPrestation`;
    } else {
      return res.status(400).send('Prestation does not have a valid user type');
    }

    // Execute the query
    const [result] = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    res.send(result);
  } catch (error) {
    console.error('Error fetching prestation:', error);
    res.status(500).send('Error fetching prestation');
  }
});
router.post('/createPrestation', async (req, res) => {
  const {user} = req.session;
  const {id_BienImmobilier, date, lieux, ville, typeIntervention, nom, description} = req.body; // Extract description from req.body
  console.log('Creating prestation:', req.body);

  let query = '';
  let replacements = {};

  switch(user.type) {
    case 'clientsBailleurs':
      query = `INSERT INTO prestation (id_BienImmobilier, id_ClientBailleur, date, statut, lieux, ville, typeIntervention, nom, description) VALUES (:id_BienImmobilier, :id_ClientBailleur, :date, 'EN ATTENTE', :lieux, :ville, :typeIntervention, :nom, :description)`; 
      replacements = {id_BienImmobilier, id_ClientBailleur: user.id, date, lieux, ville, typeIntervention, nom, description};
      break;
    case 'voyageurs':
      query = `INSERT INTO prestation (id_Voyageur, date, statut, lieux, ville, typeIntervention, nom, description) VALUES (:id_Voyageur, :date, 'EN ATTENTE', :lieux, :ville, :typeIntervention, :nom, :description)`; 
      replacements = {id_Voyageur: user.id, date, lieux, ville, typeIntervention, nom, description};
      break;
    default:
      res.status(400).send({ error: 'Invalid user type' });
      return;
  }

  await sequelize.query(query, { replacements });
  res.send('Prestation created');
});

router.get('/prestationsEnAttente', async (req, res) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Set the time to 00:00:00 UTC

    const [prestations] = await sequelize.query(`
      SELECT * 
      FROM prestation 
      WHERE statut = 'EN ATTENTE' 
      AND date >= '${today.toISOString().split('T')[0]}' 
    `);

    res.send(prestations);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching the data.');
  }
});

router.put('/acceptPrestation/:prestationId', async (req, res) => {
  const { user } = req.session;
  const { prestationId } = req.params;
  console.log('Accepting prestation:', prestationId);

  try {
    await sequelize.query(`UPDATE prestation SET statut = 'ACCEPTEE', id_Prestataire = ${user.id} WHERE id = ${prestationId}`);
    
    // Fetch the updated prestation record
    const [results] = await sequelize.query(`SELECT * FROM prestation WHERE id = ${prestationId}`);
    const updatedPrestation = results[0];

    res.send(updatedPrestation);
  } catch (error) {
    console.error('Error accepting prestation:', error);
    res.status(500).send('Failed to accept prestation');
  }
});

router.delete('/prestation/:id', async (req, res) => {
  const { id } = req.params;

  console.log('Deleting prestation:', id);

  try {
    await sequelize.query(`DELETE FROM prestation WHERE id = ${id}`);
    res.send('Prestation deleted');
  } catch (error) {
    console.error('Error deleting prestation:', error);
    res.status(500).send('Failed to delete prestation');
  }
});

router.put('/archiverPrestation/:prestationId', async (req, res) => {
  const { user } = req.session;
  const { prestationId } = req.params;
  console.log('Accepting prestation:', prestationId);

  try {
    await sequelize.query(`UPDATE prestation SET statut = 'TERMINEE' WHERE id = ${prestationId}`);
    
    // Fetch the updated prestation record
    const [results] = await sequelize.query(`SELECT * FROM prestation WHERE id = ${prestationId}`);
    const updatedPrestation = results[0];

    res.send(updatedPrestation);
  } catch (error) {
    console.error('Error accepting prestation:', error);
    res.status(500).send('Failed to accept prestation');
  }
});

// GESTION DES AVIS

router.post('/upload/avis/:prestationId/:prestataireId', async (req, res) => {
  try {
    const { id_BienImmobilier, id_Prestataire, typeIntervention, note, commentaire, id_Prestation } = req.body;

    // Check if all required fields are provided, except id_BienImmobilier which is optional
    if (!id_Prestataire || !typeIntervention || !note || !commentaire || !id_Prestation) {
      return res.status(400).json({ error: 'All fields except id_BienImmobilier are required' });
    }

    let query, replacements;

    // Construct query and replacements based on the presence of id_BienImmobilier
    if (id_BienImmobilier) {
      query = 'INSERT INTO evaluationPrestation (id_BienImmobilier, id_Prestataire, typeIntervention, note, commentaire, id_Prestation) VALUES (?, ?, ?, ?, ?, ?)';
      replacements = [id_BienImmobilier, id_Prestataire, typeIntervention, note, commentaire, id_Prestation];
    } else {
      query = 'INSERT INTO evaluationPrestation (id_Prestataire, typeIntervention, note, commentaire, id_Prestation) VALUES (?, ?, ?, ?, ?)';
      replacements = [id_Prestataire, typeIntervention, note, commentaire, id_Prestation];
    }

    // Insert into database
    const result = await sequelize.query(query, {
      replacements: replacements,
      type: QueryTypes.INSERT
    });

    // Send success response
    res.status(201).json({ message: 'Evaluation inserted successfully', evaluationId: result[0] }); // result[0] contains the inserted id
  } catch (error) {
    console.error('Error inserting evaluation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/avis/general/:prestataireId', async (req, res) => {
  console.log('Route /avis/general/:prestataireId called');
  const { prestataireId } = req.params;

  try {
    const [generalInfo] = await sequelize.query(`
      SELECT 
        p.nom as prestaNom, 
        p.prenom as prestaPrenom, 
        p.dateDeNaissance, 
        p.adresseMail,
        AVG(eval.note) as noteMoy,
        COUNT(*) as nombrePresta
      FROM 
        prestataires p
      JOIN 
        prestation pon ON p.id = pon.id_Prestataire
      JOIN 
        evaluationPrestation eval ON pon.id = eval.id_Prestation
      WHERE 
        p.id = :prestataireId
      GROUP BY 
        p.nom, 
        p.prenom, 
        p.dateDeNaissance, 
        p.adresseMail
    `, 
    {
      replacements: { prestataireId },
      type: sequelize.QueryTypes.SELECT,
    });

    res.json(generalInfo);
  } catch (error) {
    console.error('Error fetching general information by prestataireId:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Evaluations Route
router.get('/evaluations/avis/:prestataireId', async (req, res) => {
  console.log('Route /avis/evaluations/:prestataireId called');
  const { prestataireId } = req.params;

  try {
    // Query for evaluations with id_ClientBailleur
    const clientBailleurEvaluations = await sequelize.query(`
      SELECT 
        pon.*, 
        eval.typeIntervention, 
        eval.note,
        eval.commentaire,
        cb.prenom as demandeurPrenom,
        cb.nom as demandeurNom
      FROM 
        prestation pon 
      JOIN 
        evaluationPrestation eval ON pon.id = eval.id_Prestation
      JOIN
        clientsBailleurs cb on pon.id_ClientBailleur = cb.id
      WHERE 
        pon.id_Prestataire = :prestataireId
    `, 
    {
      replacements: { prestataireId },
      type: sequelize.QueryTypes.SELECT,
    });

    // Query for evaluations with id_Voyageur
    const voyageurEvaluations = await sequelize.query(`
      SELECT 
        pon.*, 
        eval.typeIntervention, 
        eval.note,
        eval.commentaire,
        cb.prenom as demandeurPrenom,
        cb.nom as demandeurNom
      FROM 
        prestation pon 
      JOIN 
        evaluationPrestation eval ON pon.id = eval.id_Prestation
      JOIN
        voyageurs cb on pon.id_Voyageur = cb.id
      WHERE 
        pon.id_Prestataire = :prestataireId
    `, 
    {
      replacements: { prestataireId },
      type: sequelize.QueryTypes.SELECT,
    });

    // Combine the results from both queries
    const evaluations = clientBailleurEvaluations.concat(voyageurEvaluations);

    res.json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations by prestataireId:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/avis/:prestationId/:prestataireId', async (req, res) => {
  const { prestationId, prestataireId } = req.params;

  try {
    const [results] = await sequelize.query(
      'SELECT * FROM evaluationPrestation WHERE id_Prestation = :prestationId AND id_Prestataire = :prestataireId',
      {
        replacements: { prestationId, prestataireId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'Avis not found' });
    }

    console.log(results);
    res.send(results);
  } catch (error) {
    console.error('Error fetching avis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// SERVICES SPECIFIQUES

// - Stripe 
router.post('/create-checkout-session', async (req, res) => {
  const { pId, numberOfNights } = req.body;
  console.log('Creating checkout session with price ID:', pId, 'and quantity:', numberOfNights);
  
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: pId,
          quantity: numberOfNights,
        },
      ],
      mode: 'payment',
      success_url: `${URL}/pagePaiement?success=true`,
      cancel_url: `${URL}/pagePaiement?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).send({ error: 'An error occurred while creating the checkout session.' });
  }
});

// - Socket.io


router.post('/createFirstMessage', async (req, res) => {
  const {id_sender, id_receiver, type_sender, type_receiver, content } = req.body;
  console.log('Creating message:', req.body);
  try {
    const [results] = await sequelize.query(`SELECT * FROM messages WHERE id_sender='${id_sender}' AND id_receiver='${id_receiver}' AND content='${content}'`);
    if (results.length === 0) {
      await sequelize.query(`INSERT INTO messages (id_sender, id_receiver, type_sender, type_receiver, content) VALUES ('${id_sender}', '${id_receiver}', '${type_sender}', '${type_receiver}', '${content}')`);
      await sequelize.query(`INSERT INTO messages (id_sender, id_receiver, type_sender, type_receiver, content) VALUES ('${id_receiver}', '${id_sender}', '${type_receiver}', '${type_sender}', '${content}')`);
    }
  } catch (error) {
    console.error('Error creating message:', error);
    return res.status(500).send('Error creating message');
  }
  res.send('Message created');
});

router.get('/messagesById', async (req, res) => {
  const { user } = req.session;
  try {
    const [messages] = await sequelize.query(`SELECT * FROM messages WHERE id_sender = ${user.id} AND content = 'init'`);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.get('/discussionsOfUser', async (req, res) => {
  const { user } = req.session;
  try {
    const [contacts] = await sequelize.query(`SELECT DISTINCT id_receiver, type_receiver FROM messages WHERE id_sender = ${user.id}`);
    const contactsDetailsPromises = contacts.map(async (contact) => {
      const [details] = await sequelize.query(`SELECT id, nom, prenom FROM ${contact.type_receiver} WHERE id = ${contact.id_receiver}`);
      return {...details[0], type: contact.type_receiver};
    });
    const contactsDetails = await Promise.all(contactsDetailsPromises);
    res.json(contactsDetails);
  } catch (error) {
    console.error('Error fetching discussions for specified user:', error);
    res.status(500).json({ error: 'Failed to fetch discussions' });
  }
});

router.post('/messagesOfDiscussionById', async (req, res) => {
  console.log('Route /messagesOfDiscussionById called');
  const { user } = req.session;
  const { id_receiver, type_receiver } = req.body; // Get parameters from request body for POST
  try {
    const [messages] = await sequelize.query(`
      SELECT * FROM messages 
      WHERE ((id_sender = :userId AND type_sender = :userType AND id_receiver = :idReceiver AND type_receiver = :typeReceiver)
      OR (id_sender = :idReceiver AND type_sender = :typeReceiver AND id_receiver = :userId AND type_receiver = :userType))
      AND content != 'init'
    `, {
      replacements: { 
        userId: user.id, 
        userType: user.type, 
        idReceiver: id_receiver, 
        typeReceiver: type_receiver 
      }
    });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages of discussion:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});


router.post('/storeMessage', async (req, res) => {
  const { user } = req.session;
  const { id_receiver, type_receiver, content } = req.body;
  console.log('Creating message:', req.body);

  let query = '';
  let replacements = {};

  switch(user.type) {
    case 'clientsBailleurs':
      query = `INSERT INTO messages (id_sender, id_receiver, type_sender, type_receiver, content) VALUES (:id_sender, :id_receiver, :type_sender, :type_receiver, :content)`;
      replacements = {id_sender: user.id, id_receiver, type_sender: user.type, type_receiver, content};
      break;
    case 'voyageurs':
      query = `INSERT INTO messages (id_sender, id_receiver, type_sender, type_receiver, content) VALUES (:id_sender, :id_receiver, :type_sender, :type_receiver, :content)`;
      replacements = {id_sender: user.id, id_receiver, type_sender: user.type, type_receiver, content};
      break;
    default:
      res.status(400).send({ error: 'Invalid user type' });
      return;
  }

  try {
    await sequelize.query(query, { replacements });
  } catch (error) {
    console.error('Error creating message:', error);
    return res.status(500).send('Error creating message');
  }

  res.send('Message created');
});


const path = require('path');
const fs = require('fs');

router.post('/save-pdf', upload.single('file'), (req, res) => {
  const pdfFile = req.file;

  // Ensure the file is a PDF
  if (pdfFile.mimetype !== 'application/pdf') {
    return res.status(400).send('Invalid file type');
  }

  const filePath = path.join(__dirname, '../uploads/', pdfFile.originalname);

  fs.rename(pdfFile.path, filePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error saving file');
    }
    res.status(200).send('File saved successfully');
  });
});

router.post('/createFinance', async (req, res) => {
  const { id_ClientBailleur, id_Prestataire, id_Voyageur, type, montant, dateTransaction, nomDocument } = req.body;
  console.log('Creating finance:', req.body);

  let query = '';
  let replacements = {};

  if (id_ClientBailleur) {
    query = 'INSERT INTO finances (id_ClientBailleur, montant, dateTransaction, type, nomDocument) VALUES (:id_ClientBailleur, :montant, :dateTransaction, :type, :nomDocument)';
    replacements = {id_ClientBailleur, montant, dateTransaction, type, nomDocument};
  } else if (id_Prestataire) {
    query = 'INSERT INTO finances (id_Prestataire, montant, dateTransaction, type, nomDocument) VALUES (:id_Prestataire, :montant, :dateTransaction, :type, :nomDocument)';
    replacements = {id_Prestataire, montant, dateTransaction, type, nomDocument};
  } else if (id_Voyageur) {
    query = 'INSERT INTO finances (id_Voyageur, montant, dateTransaction, type, nomDocument) VALUES (:id_Voyageur, :montant, :dateTransaction, :type, :nomDocument)';
    replacements = {id_Voyageur, montant, dateTransaction, type, nomDocument};
  } else {
    res.status(400).send({ error: 'Invalid user type' });
    return;
  }

  try {
    await sequelize.query(query, { replacements });
  } catch (error) {
    console.error('Error creating finance:', error);
    return res.status(500).send('Error creating finance');
  }

  res.send('Finance created');
});

router.get('/financesByUserId', async (req, res) => {
  const { user } = req.session;
  let query = '';

  switch(user.type) {
    case 'clientsBailleurs':
      query = `SELECT * FROM finances WHERE id_ClientBailleur = ${user.id}`;
      break;
  
    case 'voyageurs':
      query = `SELECT * FROM finances WHERE id_Voyageur = ${user.id}`;
      break;
  
    case 'prestataires':
      query = `SELECT * FROM finances WHERE id_Prestataire = ${user.id}`;
      break;
  
    default:
      res.status(400).send({ error: 'Invalid user type' });
      return;
  }

  try {
    const [finances] = await sequelize.query(query);
    res.send(finances);
  } catch (error) {
    console.error('Error fetching finances:', error);
    res.status(500).send('Error fetching finances');
  }
});

router.get('/download/:file', (req, res) => {
  // Adjust the path to point to the correct location of the uploads directory
  const filePath = path.resolve(__dirname, '..', 'uploads', req.params.file);
  res.download(filePath, req.params.file, (err) => {
    if (err) {
      console.error(`Error downloading file: ${err.message}`);
      res.status(404).send('File not found');
    }
  });
});