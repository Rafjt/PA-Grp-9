const express = require("express");
const sequelize = require("../database");
// const {fs} = require('fs');
const { QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const multer = require('multer');
const router = express.Router();
const { exec } = require("child_process");
const mailRoute = require("./mailCode");
const { Console } = require("console");
router.use("/mail", mailRoute);

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

      // Insert data into the permanent table
      for (const row of tempTableData) {
        await sequelize.query(
          `INSERT INTO ${row.type} (nom, prenom, adresseMail, motDePasse, admin, dateDeNaissance) 
        VALUES ('${row.nom}', '${row.prenom}', '${row.adresseMail}', '${row.motDePasse}', ${row.admin}, '${row.dateDeNaissance}')`
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
  } = req.body; // Get the filename of the uploaded image
  const pictures = req.file.filename; // Get the filename of the uploaded image
  console.log('pictures ==', pictures); // Log uploaded file information
  // Handle description escaping single quotes
  const newDescription = description.replace(/'/g, "''");

  try {
    await sequelize.query(
      `INSERT INTO bienImo (nomBien, description, id_ClientBailleur, statutValidation, prix, disponible, typeDePropriete, nombreChambres, nombreLits, nombreSallesDeBain, wifi, cuisine, balcon, jardin, parking, piscine, jaccuzzi, salleDeSport, climatisation, cheminImg, ville, adresse) VALUES ('${nomBien}', '${newDescription}', '${id_ClientBailleur}', '0', '${prix}', '${disponible}', '${typeDePropriete}', '${nombreChambres}', '${nombreLits}', '${nombreSallesDeBain}', '${wifi}', '${cuisine}', '${balcon}', '${jardin}', '${parking}', '${piscine}', '${jaccuzzi}', '${salleDeSport}', '${climatisation}', '${pictures}', '${ville}', '${adresse}')`
    );
  } catch (error) {
    console.error('Error creating bien:', error);
    return res.status(500).send('Error creating bien');
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

router.put('/bienImo/:id', upload.single('cheminImg'), async (req, res) => {
  console.log('Modifying bien:', req.body);
  const { id } = req.params;
  let pictures = req.body.cheminImg; // Use existing image by default
  if (req.file) {
    pictures = req.file.filename; // If a new file was uploaded, use it instead
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
  newDescription = description.replace(/'/g, "''");
  console.log('prix est :', prix);
  try {
    await sequelize.query(
      `UPDATE bienImo SET nomBien = '${nomBien}', description = '${newDescription}', id_ClientBailleur = '${id_ClientBailleur}', prix = '${prix}', disponible = '${disponible}', typeDePropriete = '${typeDePropriete}', nombreChambres = '${nombreChambres}', nombreLits = '${nombreLits}', nombreSallesDeBain = '${nombreSallesDeBain}', wifi = '${wifi}', cuisine = '${cuisine}', balcon = '${balcon}', jardin = '${jardin}', parking = '${parking}', piscine = '${piscine}', jaccuzzi = '${jaccuzzi}', salleDeSport = '${salleDeSport}', climatisation = '${climatisation}', cheminImg = '${pictures}', ville = '${ville}', adresse = '${adresse}' WHERE id = ${id}`
    );
  } catch (error) {
    console.error('Error modifying bien:', error);
  }
  res.send('Bien modified');
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

// GESTION DES RESERVATIONS

router.get("/reservation", async (req, res) => {
  const [reservation] = await sequelize.query("SELECT * FROM reservation");
  console.log(reservation);
  res.send(reservation);
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