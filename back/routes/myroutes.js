const express = require("express");
const sequelize = require("../database");
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
const xss = require('xss');
const URL = process.env.PCS_URL;



router.get('/users/mean-age', async (req, res) => {
  try {
    const query = `
        SELECT AVG(age) AS mean_age FROM (
            SELECT TIMESTAMPDIFF(YEAR, dateDeNaissance, CURDATE()) AS age FROM voyageurs
            UNION ALL
            SELECT TIMESTAMPDIFF(YEAR, dateDeNaissance, CURDATE()) AS age FROM clientsBailleurs
            UNION ALL
            SELECT TIMESTAMPDIFF(YEAR, dateDeNaissance, CURDATE()) AS age FROM prestataires
        ) AS all_users;
        `;

    const [result] = await sequelize.query(query, { type: QueryTypes.SELECT });

    res.json(result);
  } catch (error) {
    console.error('Error fetching mean age:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage });



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

  // Object to map user types to their related table dependencies
  const dependencies = {
    clientsBailleurs: [
      { table: "bienImo", foreignKey: "id_ClientBailleur" },
      { table: "contrat", foreignKey: "id_Bailleur" },
      { table: "facture", foreignKey: "id_ClientBailleur" },
      { table: "finances", foreignKey: "id_ClientBailleur" },
      { table: "etatDesLieux", foreignKey: "id_Bailleur" },
      { table: "signalement", foreignKey: "id_ClientBailleur" },
      { table: "prestation", foreignKey: "id_ClientBailleur" }
    ],
    prestataires: [
      { table: "contrat", foreignKey: "id_Prestataire" },
      { table: "evaluationPrestation", foreignKey: "id_Prestataire" },
      { table: "finances", foreignKey: "id_Prestataire" },
      { table: "prestation", foreignKey: "id_Prestataire" },
      { table: "demandeDomaine", foreignKey: "ID_Prestataire" },
      { table: "signalement", foreignKey: "id_Prestataire" }
    ],
    voyageurs: [
      { table: "abonnement", foreignKey: "id_Voyageur" },
      { table: "contrat", foreignKey: "id_Voyageur" },
      { table: "finances", foreignKey: "id_Voyageur" },
      { table: "prestation", foreignKey: "id_Voyageur" },
      { table: "reservation", foreignKey: "id_ClientVoyageur" },
      { table: "signalement", foreignKey: "id_Voyageur" }
    ]
  };

  try {
    await sequelize.transaction(async (t) => {
      if (userType in dependencies) {
        for (const { table, foreignKey } of dependencies[userType]) {
          await sequelize.query(`DELETE FROM ${table} WHERE ${foreignKey} = :id`, {
            replacements: { id },
            transaction: t
          });
        }
      }

      await sequelize.query(`DELETE FROM ${userType} WHERE id = :id`, {
        replacements: { id },
        transaction: t
      });
    });

    res.json("User deleted");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json("Failed to delete user");
  }
});

// ROUTES TEST

router.get("/", (req, res) => {
  res.send("Home Page Route");
});

router.get("/about", (req, res) => {
  res.send("About Page Route");
});

router.get("/portfolio", (req, res) => {
  res.send("Portfolio Page Route");
});

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
  res.send(users[0]);
});

router.post("/users/code/:code", async (req, res) => {
  const { code } = req.params;
  console.log("Verifying code...", code);

  try {

    const tableExists = await sequelize.query(`SHOW TABLES LIKE '${code}'`, {
      type: QueryTypes.SELECT,
    });

    if (tableExists.length === 0) {
      return res.status(404).send("Table temporaire introuvable");
    } else {

      const tempTableData = await sequelize.query(`SELECT * FROM \`${code}\``, {
        type: QueryTypes.SELECT,
      });

      if (tempTableData.length === 0) {
        return res.status(404).send("La table temporaire est vide");
      }

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

  try {

    const fieldsToUpdate = {};

    if (req.body.nom !== undefined) fieldsToUpdate.nom = req.body.nom;
    if (req.body.prenom !== undefined) fieldsToUpdate.prenom = req.body.prenom;
    if (req.body.adresseMail !== undefined) fieldsToUpdate.adresseMail = req.body.adresseMail;
    if (req.body.dateDeNaissance !== undefined) fieldsToUpdate.dateDeNaissance = req.body.dateDeNaissance;
    if (req.body.admin !== undefined) fieldsToUpdate.admin = req.body.admin;

    if (req.body.motDePasse !== undefined) {
      const hashedPassword = await bcrypt.hash(req.body.motDePasse, 10); 
      fieldsToUpdate.motDePasse = hashedPassword;
    }

    const setClause = Object.keys(fieldsToUpdate)
      .map(field => `${field} = ?`)
      .join(', ');
    const values = Object.values(fieldsToUpdate);
    values.push(id);

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
  const { id, type } = req.params;
  const { nom, prenom, adresseMail } = req.body;

  const dependencies = {
    clientsBailleurs: [
      { table: "bienImo", foreignKey: "id_ClientBailleur" },
      { table: "contrat", foreignKey: "id_Bailleur" },
      { table: "facture", foreignKey: "id_ClientBailleur" },
      { table: "finances", foreignKey: "id_ClientBailleur" },
      { table: "etatDesLieux", foreignKey: "id_Bailleur" },
      { table: "signalement", foreignKey: "id_ClientBailleur" },
      { table: "prestation", foreignKey: "id_ClientBailleur" }
    ],
    prestataires: [
      { table: "contrat", foreignKey: "id_Prestataire" },
      { table: "evaluationPrestation", foreignKey: "id_Prestataire" },
      { table: "finances", foreignKey: "id_Prestataire" },
      { table: "prestation", foreignKey: "id_Prestataire" },
      { table: "demandeDomaine", foreignKey: "ID_Prestataire" },
      { table: "signalement", foreignKey: "id_Prestataire" }
    ],
    voyageurs: [
      { table: "abonnement", foreignKey: "id_Voyageur" },
      { table: "contrat", foreignKey: "id_Voyageur" },
      { table: "finances", foreignKey: "id_Voyageur" },
      { table: "prestation", foreignKey: "id_Voyageur" },
      { table: "reservation", foreignKey: "id_ClientVoyageur" },
      { table: "signalement", foreignKey: "id_Voyageur" }
    ]
  };

  try {
    await sequelize.transaction(async (t) => {

      await sequelize.query(
        `INSERT INTO userBannis (nom, prenom, adresseMail, dateBanissement) VALUES (:nom, :prenom, :adresseMail, NOW());`,
        {
          replacements: { nom, prenom, adresseMail },
          transaction: t
        }
      );


      if (type in dependencies) {
        for (const { table, foreignKey } of dependencies[type]) {
          await sequelize.query(`DELETE FROM ${table} WHERE ${foreignKey} = :id`, {
            replacements: { id },
            transaction: t
          });
        }
      }


      await sequelize.query(`DELETE FROM ${type} WHERE id = :id`, {
        replacements: { id },
        transaction: t
      });
    });

    res.json("User banned");
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json("Error banning user");
  }
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

router.get("/users/nonValide", async (req, res) => {
  try {
    const [nonValide] = await sequelize.query("SELECT * FROM prestataires WHERE valide = 0");
    res.json(nonValide);
  } catch (error) {
    console.error("Error fetching nonValide:", error);
    res.status(500).json({ error: "Failed to fetch nonValide" });
  }
}
);

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

router.get("/Domaines", async (req, res) => {
  const { user } = req.session;
  try {
    const [domaines] = await sequelize.query(`SELECT domaine FROM prestataires WHERE valide = 1 and id = ${user.id} ;`);
    res.json(domaines);
  } catch (error) {
    console.error("Error fetching domaines:", error);
    res.status(500).json({ error: "Failed to fetch domaines" });
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
    const prixMoy = result[0][0].prixMoy; 
    res.json({ prixMoy });
  } catch (error) {
    console.error('Error fetching prixMoy:', error);
    res.status(500).json({ error: "L'ordinateur s'autodétruira dans 3 secondes" });
  }
});


router.get("/bienImo", async (req, res) => {
  const results = await sequelize.query(`
    SELECT b.*, i.imagePath
    FROM bienImo b
    LEFT JOIN bienImoImages i ON b.id = i.bienImoId
  `);

  const biens = [];
  let currentBien = null;

  for (const result of results[0]) {
    if (!currentBien || currentBien.id !== result.id) {
      currentBien = {
        id: result.id,
        ville: result.ville,
        adresse: result.adresse,
        id_ClientBailleur: result.id_ClientBailleur,
        prix: result.prix,
        nomBien: result.nomBien,
        description: result.description,
        statutValidation: result.statutValidation,
        disponible: result.disponible,
        typeDePropriete: result.typeDePropriete,
        nombreChambres: result.nombreChambres,
        nombreLits: result.nombreLits,
        nombreSallesDeBain: result.nombreSallesDeBain,
        wifi: result.wifi,
        cuisine: result.cuisine,
        balcon: result.balcon,
        jardin: result.jardin,
        parking: result.parking,
        piscine: result.piscine,
        jaccuzzi: result.jaccuzzi,
        salleDeSport: result.salleDeSport,
        climatisation: result.climatisation,
        productId: result.productId,
        images: []
      };
      biens.push(currentBien);
    }

    if (result.imagePath) {
      currentBien.images.push(result.imagePath);
    }
  }

  res.send(biens);
});

router.delete('/bienImo/:id', async (req, res) => {
  const { id } = req.params;

  try {

    const [results] = await sequelize.query(
      `SELECT imagePath FROM bienImoImages WHERE bienImoId = ${id}`
    );

    const imagePaths = results.map(row => row.imagePath);
    console.log('imagePaths:', imagePaths);

    for (const imgPath of imagePaths) {
      const fullPath = path.join(__dirname, '..', imgPath);
      try {
        await fs.unlink(fullPath);
        console.log(`Deleted image ${fullPath}`);
      } catch (err) {
        console.error(`Error deleting image ${fullPath}:`, err);
      }
    }

    await sequelize.query(
      `DELETE FROM contrat WHERE id_Reservation IN (SELECT id FROM reservation WHERE id_BienImmobilier = ${id})`
    );
    await sequelize.query(
      `DELETE FROM contrat WHERE id_Prestation IN (SELECT id FROM prestation WHERE id_BienImmobilier = ${id})`
    );
    await sequelize.query(
      `DELETE FROM etatDesLieux WHERE id_Reservation IN (SELECT id FROM reservation WHERE id_BienImmobilier = ${id})`
    );
    await sequelize.query(
      `DELETE FROM evaluationPrestation WHERE id_Prestation IN (SELECT id FROM prestation WHERE id_BienImmobilier = ${id})`
    );
    await sequelize.query(
      `DELETE FROM facture WHERE id_Reservation IN (SELECT id FROM reservation WHERE id_BienImmobilier = ${id})`
    );
    await sequelize.query(
      `DELETE FROM paiement WHERE id_Reservation IN (SELECT id FROM reservation WHERE id_BienImmobilier = ${id})`
    );

    await sequelize.query(
      `DELETE FROM bienImoImages WHERE bienImoId = ${id}`
    );
    await sequelize.query(
      `DELETE FROM etatDesLieux WHERE id_BienImmobilier = ${id}`
    );
    await sequelize.query(
      `DELETE FROM evaluationPrestation WHERE id_BienImmobilier = ${id}`
    );
    await sequelize.query(
      `DELETE FROM prestation WHERE id_BienImmobilier = ${id}`
    );
    await sequelize.query(
      `DELETE FROM reservation WHERE id_BienImmobilier = ${id}`
    );

    await sequelize.query(
      `DELETE FROM bienImo WHERE id = ${id}`
    );

    console.log('Deleted bienImo and related entries for bien:', id);
    res.send("Bien deleted");
  } catch (error) {
    console.error('Error deleting bien:', error);
    res.status(500).send('Failed to delete bien');
  }
});

router.post('/bienImo', upload.array('pictures', 10), async (req, res) => {
  console.log('req.body:', req.body);
  console.log('req.files:', req.files);

  const formData = req.body;

  const logFormData = (formData) => {
    for (let [key, value] of Object.entries(formData)) {
      console.log(`${key}: ${value}`);
    }
  };

  logFormData(formData);

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
    adresse
  } = req.body;

  try {
    if (!nomBien || !description) {
      throw new Error('Missing required fields: nomBien or description');
    }

    const product = await stripe.products.create({
      name: nomBien,
      description: description,
    });

    const stripePrice = await stripe.prices.create({

      unit_amount: prix * 100, 
      currency: 'eur', 
      product: product.id, 

    });

    const [result] = await sequelize.query(
      `INSERT INTO bienImo (
        nomBien, description, id_ClientBailleur, statutValidation, prix, disponible, typeDePropriete,
        nombreChambres, nombreLits, nombreSallesDeBain, wifi, cuisine, balcon, jardin, parking,
        piscine, jaccuzzi, salleDeSport, climatisation, ville, adresse, productId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          nomBien, description, id_ClientBailleur, 0, prix, disponible, typeDePropriete,
          nombreChambres, nombreLits, nombreSallesDeBain, wifi, cuisine, balcon, jardin, parking,
          piscine, jaccuzzi, salleDeSport, climatisation, ville, adresse, stripePrice.id
        ],
        type: sequelize.QueryTypes.INSERT
      }
    );

    const bienImoId = result;

    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file => {
        return sequelize.query(
          `INSERT INTO bienImoImages (bienImoId, imagePath) VALUES (?, ?)`,
          {
            replacements: [bienImoId, file.path],
            type: sequelize.QueryTypes.INSERT
          }
        );
      });
      await Promise.all(imagePromises);
    }

    res.status(200).json({ message: 'Bien created successfully', bienImoId });
  } catch (error) {
    console.error('Error creating bien:', error.message);
    res.status(500).json({ message: 'Error creating bien', error: error.message });
  }
});


router.get("/bienImo/:id", async (req, res) => {
  console.log("route /bienImo/:id called");
  const id = req.params.id;

  try {
    const [results] = await sequelize.query(
      `SELECT b.*, i.imagePath
       FROM bienImo b
       LEFT JOIN bienImoImages i ON b.id = i.bienImoId
       WHERE b.id = ${id}`
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'Bien not found' });
    }

    const bienImo = {
      id: results[0].id,
      ville: results[0].ville,
      adresse: results[0].adresse,
      id_ClientBailleur: results[0].id_ClientBailleur,
      prix: results[0].prix,
      nomBien: results[0].nomBien,
      description: results[0].description,
      statutValidation: results[0].statutValidation,
      disponible: results[0].disponible,
      typeDePropriete: results[0].typeDePropriete,
      nombreChambres: results[0].nombreChambres,
      nombreLits: results[0].nombreLits,
      nombreSallesDeBain: results[0].nombreSallesDeBain,
      wifi: results[0].wifi,
      cuisine: results[0].cuisine,
      balcon: results[0].balcon,
      jardin: results[0].jardin,
      parking: results[0].parking,
      piscine: results[0].piscine,
      jaccuzzi: results[0].jaccuzzi,
      salleDeSport: results[0].salleDeSport,
      climatisation: results[0].climatisation,
      productId: results[0].productId,
      images: []
    };

    for (const result of results) {
      if (result.imagePath) {
        bienImo.images.push(result.imagePath);
      }
    }

    console.log(bienImo);
    res.send(bienImo);

  } catch (error) {
    console.error('Error fetching bien:', error);
    res.status(500).json({ message: 'Error fetching bien', error: error.message });
  }
});


router.put('/bienImo/:id', upload.array('cheminImg', 10), async (req, res) => {
  const { id } = req.params;
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
      WHERE id = ${id}`
    );

    if (req.files && req.files.length > 0) {
      const imagePaths = req.files.map(file => 'uploads/' + file.filename);

      for (const imagePath of imagePaths) {
        await sequelize.query(
          `INSERT INTO bienImoImages (bienImoId, imagePath) VALUES (${id}, '${imagePath}')`
        );
      }

      const [results] = await sequelize.query(
        `SELECT imagePath FROM bienImoImages WHERE bienImoId = ${id} AND imagePath NOT IN ('${imagePaths.join("','")}')`
      );

      for (const row of results) {
        const fullPath = path.join(__dirname, '..', row.imagePath);
        fs.unlink(fullPath, (err) => {
          if (err) {
            console.error(`Error deleting image ${fullPath}:`, err);
          } else {
            console.log(`Deleted image ${fullPath}`);
          }
        });
      }

      await sequelize.query(
        `DELETE FROM bienImoImages WHERE bienImoId = ${id} AND imagePath NOT IN ('${imagePaths.join("','")}')`
      );
    }

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

  nombreChambres = nombreChambres !== 'Tout' ? parseInt(nombreChambres) : nombreChambres;
  nombreLits = nombreLits !== 'Tout' ? parseInt(nombreLits) : nombreLits;
  nombreSallesDeBain = nombreSallesDeBain !== 'Tout' ? parseInt(nombreSallesDeBain) : nombreSallesDeBain;
  ville = ville !== 'Tout' ? ville : ville;

  let query = `
      SELECT b.*, i.imagePath
      FROM bienImo b
      LEFT JOIN bienImoImages i ON b.id = i.bienImoId
  `;
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

  let whereClause = '';

  for (const property in properties) {
    if (properties[property] !== undefined && properties[property] !== 'Tout' && properties[property] !== 0) {
      if (whereClause === '') {
        whereClause = ' WHERE';
      } else {
        whereClause += ' AND';
      }

      whereClause += ` ${property} = ?`;
      params.push(properties[property]);
    }
  }

  if (prixMin) {
    if (whereClause === '') {
      whereClause = ' WHERE';
    } else {
      whereClause += ' AND';
    }

    whereClause += ' prix >= ?';
    params.push(prixMin);
  }

  if (prixMax) {
    if (whereClause === '') {
      whereClause = ' WHERE';
    } else {
      whereClause += ' AND';
    }

    whereClause += ' prix <= ?';
    params.push(prixMax);
  }

  query += whereClause;

  try {
    const results = await sequelize.query(query, {
      replacements: params,
      type: sequelize.QueryTypes.SELECT,
    });

    const biens = [];
    let currentBien = null;

    for (const result of results) {
      if (!currentBien || currentBien.id !== result.id) {
        currentBien = {
          id: result.id,
          ville: result.ville,
          adresse: result.adresse,
          id_ClientBailleur: result.id_ClientBailleur,
          prix: result.prix,
          nomBien: result.nomBien,
          description: result.description,
          statutValidation: result.statutValidation,
          disponible: result.disponible,
          typeDePropriete: result.typeDePropriete,
          nombreChambres: result.nombreChambres,
          nombreLits: result.nombreLits,
          nombreSallesDeBain: result.nombreSallesDeBain,
          wifi: result.wifi,
          cuisine: result.cuisine,
          balcon: result.balcon,
          jardin: result.jardin,
          parking: result.parking,
          piscine: result.piscine,
          jaccuzzi: result.jaccuzzi,
          salleDeSport: result.salleDeSport,
          climatisation: result.climatisation,
          images: []
        };
        biens.push(currentBien);
      }

      if (result.imagePath) {
        currentBien.images.push(result.imagePath);
      }
    }

    res.json(biens);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while filtering' });
  }
});


router.get('/biens', async (req, res) => {
  const { user } = req.session;
  const results = await sequelize.query(`
    SELECT b.*, i.imagePath
    FROM bienImo b
    LEFT JOIN bienImoImages i ON b.id = i.bienImoId
    WHERE b.id_ClientBailleur = ${user.id}
  `);

  const biens = [];
  let currentBien = null;

  for (const result of results[0]) {
    if (!currentBien || currentBien.id !== result.id) {
      currentBien = {
        id: result.id,
        ville: result.ville,
        adresse: result.adresse,
        id_ClientBailleur: result.id_ClientBailleur,
        prix: result.prix,
        nomBien: result.nomBien,
        description: result.description,
        statutValidation: result.statutValidation,
        disponible: result.disponible,
        typeDePropriete: result.typeDePropriete,
        nombreChambres: result.nombreChambres,
        nombreLits: result.nombreLits,
        nombreSallesDeBain: result.nombreSallesDeBain,
        wifi: result.wifi,
        cuisine: result.cuisine,
        balcon: result.balcon,
        jardin: result.jardin,
        parking: result.parking,
        piscine: result.piscine,
        jaccuzzi: result.jaccuzzi,
        salleDeSport: result.salleDeSport,
        climatisation: result.climatisation,
        productId: result.productId,
        images: []
      };
      biens.push(currentBien);
    }

    if (result.imagePath) {
      currentBien.images.push(result.imagePath);
    }
  }

  res.send(biens);
});

router.post('/bienImo/bienByBailleurId', async (req, res) => {
  const userId = req.body.id;
  const results = await sequelize.query(`
    SELECT b.*, i.imagePath
    FROM bienImo b
    LEFT JOIN bienImoImages i ON b.id = i.bienImoId
    WHERE b.id_ClientBailleur = ${userId}
  `);

  const biens = [];
  let currentBien = null;

  for (const result of results[0]) {
    if (!currentBien || currentBien.id !== result.id) {
      currentBien = {
        id: result.id,
        ville: result.ville,
        adresse: result.adresse,
        id_ClientBailleur: result.id_ClientBailleur,
        prix: result.prix,
        nomBien: result.nomBien,
        description: result.description,
        statutValidation: result.statutValidation,
        disponible: result.disponible,
        typeDePropriete: result.typeDePropriete,
        nombreChambres: result.nombreChambres,
        nombreLits: result.nombreLits,
        nombreSallesDeBain: result.nombreSallesDeBain,
        wifi: result.wifi,
        cuisine: result.cuisine,
        balcon: result.balcon,
        jardin: result.jardin,
        parking: result.parking,
        piscine: result.piscine,
        jaccuzzi: result.jaccuzzi,
        salleDeSport: result.salleDeSport,
        climatisation: result.climatisation,
        productId: result.productId,
        images: []
      };
      biens.push(currentBien);
    }

    if (result.imagePath) {
      currentBien.images.push(result.imagePath);
    }
  }

  res.send(biens);
});


router.get('/getBienReserve', async (req, res) => {
  const { user } = req.session;
  const today = new Date().toISOString().split('T')[0]; 

  try {
    const results = await sequelize.query(`
      SELECT b.*, i.imagePath
      FROM bienImo b
      LEFT JOIN bienImoImages i ON b.id = i.bienImoId
      INNER JOIN reservation r ON b.id = r.id_BienImmobilier
      WHERE b.id_ClientBailleur = ${user.id}
        AND r.dateDebut >= '${today}'
        AND NOT EXISTS (
          SELECT 1 FROM etatDesLieux e
          WHERE e.id_BienImmobilier = b.id
        )
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    const biens = [];
    let currentBien = null;

    for (const result of results) {
      if (!currentBien || currentBien.id !== result.id) {
        currentBien = {
          id: result.id,
          ville: result.ville,
          adresse: result.adresse,
          id_ClientBailleur: result.id_ClientBailleur,
          prix: result.prix,
          nomBien: result.nomBien,
          description: result.description,
          statutValidation: result.statutValidation,
          disponible: result.disponible,
          typeDePropriete: result.typeDePropriete,
          nombreChambres: result.nombreChambres,
          nombreLits: result.nombreLits,
          nombreSallesDeBain: result.nombreSallesDeBain,
          wifi: result.wifi,
          cuisine: result.cuisine,
          balcon: result.balcon,
          jardin: result.jardin,
          parking: result.parking,
          piscine: result.piscine,
          jaccuzzi: result.jaccuzzi,
          salleDeSport: result.salleDeSport,
          climatisation: result.climatisation,
          productId: result.productId,
          images: []
        };
        biens.push(currentBien);
      }

      if (result.imagePath) {
        currentBien.images.push(result.imagePath);
      }
    }

    res.send(biens);
  } catch (error) {
    console.error('Error fetching reserved biens:', error);
    res.status(500).send('Internal Server Error');
  }
});



// GESTION DES RESERVATIONS

router.get('/MyCalendar', async (req, res) => {
  const { user } = req.session;
  try {

    const [bienImos] = await sequelize.query(`SELECT * FROM bienImo WHERE id_ClientBailleur = ${user.id}`);

    const bienImoIds = bienImos.map(bienImo => bienImo.id);

    const [reservations] = await sequelize.query(`SELECT * FROM reservation WHERE id_BienImmobilier IN (${bienImoIds.join(',')})`);

    res.json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching reservations.' });
  }
});


router.get('/reservation', async (req, res) => {
  try {
    const results = await sequelize.query(`
      SELECT r.*, r.id AS resId, bi.*, cb.nom AS bailleurNom, cb.prenom AS bailleurPrenom, cb.adresseMail AS bailleurMail, 
             v.nom AS voyageurNom, v.prenom AS voyageurPrenom, v.adresseMail AS voyageurMail, i.imagePath
      FROM reservation r
      JOIN bienImo bi ON r.id_BienImmobilier = bi.id 
      JOIN clientsBailleurs cb ON bi.id_ClientBailleur = cb.id
      JOIN voyageurs v ON r.id_ClientVoyageur = v.id
      LEFT JOIN bienImoImages i ON bi.id = i.bienImoId
    `);

    const reservations = [];
    const reservationMap = new Map();

    for (const result of results[0]) {
      if (!reservationMap.has(result.resId)) {
        const newReservation = {
          id: result.resId,
          id_BienImmobilier: result.id_BienImmobilier,
          id_ClientVoyageur: result.id_ClientVoyageur,
          dateDebut: result.dateDebut,
          dateFin: result.dateFin,
          statut: result.statut,
          nomBien: result.nomBien,
          prix: result.prix,
          cheminImg: result.cheminImg,
          id_servicesupp: result.id_servicesupp,
          ville: result.ville,
          adresse: result.adresse,
          id_ClientBailleur: result.id_ClientBailleur,
          description: result.description,
          statutValidation: result.statutValidation,
          disponible: result.disponible,
          typeDePropriete: result.typeDePropriete,
          nombreChambres: result.nombreChambres,
          nombreLits: result.nombreLits,
          nombreSallesDeBain: result.nombreSallesDeBain,
          wifi: result.wifi,
          cuisine: result.cuisine,
          balcon: result.balcon,
          jardin: result.jardin,
          parking: result.parking,
          piscine: result.piscine,
          jaccuzzi: result.jaccuzzi,
          salleDeSport: result.salleDeSport,
          climatisation: result.climatisation,
          bailleurNom: result.bailleurNom,
          bailleurPrenom: result.bailleurPrenom,
          bailleurMail: result.bailleurMail,
          voyageurNom: result.voyageurNom,
          voyageurPrenom: result.voyageurPrenom,
          voyageurMail: result.voyageurMail,
          images: []
        };
        reservationMap.set(result.resId, newReservation);
        reservations.push(newReservation);
      }

      if (result.imagePath) {
        reservationMap.get(result.resId).images.push(result.imagePath);
      }
    }

    console.log(reservations);
    res.send(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).send("Internal server error");
  }
});


router.get('/reservationFiltered', async (req, res) => {
  try {
    const results = await sequelize.query(`
      SELECT r.*, r.id AS resId, bi.*, cb.nom AS bailleurNom, cb.prenom AS bailleurPrenom, cb.adresseMail AS bailleurMail, 
             v.nom AS voyageurNom, v.prenom AS voyageurPrenom, v.adresseMail AS voyageurMail, i.imagePath
      FROM reservation r
      JOIN bienImo bi ON r.id_BienImmobilier = bi.id 
      JOIN clientsBailleurs cb ON bi.id_ClientBailleur = cb.id
      JOIN voyageurs v ON r.id_ClientVoyageur = v.id
      LEFT JOIN bienImoImages i ON bi.id = i.bienImoId
    `);

    const reservations = [];
    const reservationMap = new Map();

    for (const result of results[0]) {
      if (!reservationMap.has(result.resId)) {
        const newReservation = {
          id: result.resId,
          id_BienImmobilier: result.id_BienImmobilier,
          id_ClientVoyageur: result.id_ClientVoyageur,
          dateDebut: result.dateDebut,
          dateFin: result.dateFin,
          statut: result.statut,
          nomBien: result.nomBien,
          prix: result.prix,
          cheminImg: result.cheminImg,
          id_servicesupp: result.id_servicesupp,
          ville: result.ville,
          adresse: result.adresse,
          id_ClientBailleur: result.id_ClientBailleur,
          description: result.description,
          statutValidation: result.statutValidation,
          disponible: result.disponible,
          typeDePropriete: result.typeDePropriete,
          nombreChambres: result.nombreChambres,
          nombreLits: result.nombreLits,
          nombreSallesDeBain: result.nombreSallesDeBain,
          wifi: result.wifi,
          cuisine: result.cuisine,
          balcon: result.balcon,
          jardin: result.jardin,
          parking: result.parking,
          piscine: result.piscine,
          jaccuzzi: result.jaccuzzi,
          salleDeSport: result.salleDeSport,
          climatisation: result.climatisation,
          bailleurNom: result.bailleurNom,
          bailleurPrenom: result.bailleurPrenom,
          bailleurMail: result.bailleurMail,
          voyageurNom: result.voyageurNom,
          voyageurPrenom: result.voyageurPrenom,
          voyageurMail: result.voyageurMail,
          images: []
        };
        reservationMap.set(result.resId, newReservation);
        reservations.push(newReservation);
      }

      if (result.imagePath) {
        reservationMap.get(result.resId).images.push(result.imagePath);
      }
    }

    console.log(reservations);
    res.send(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).send("Internal server error");
  }
});


router.delete('/reservation/:id', async (req, res) => {
  const { id } = req.params;

  console.log('trying to delete reservation:', id);

  try {

    await sequelize.query(`DELETE FROM paiement WHERE id_Reservation = ${id}`);

    await sequelize.query(`DELETE FROM reservation WHERE id = ${id}`);

    res.send('Reservation and associated payment deleted');
  } catch (error) {
    console.error('Error deleting reservation and associated payment:', error);
    res.status(500).send('Failed to delete reservation and associated payment');
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
    nomBien = result[0].nomBien; 
  } catch (error) {
    console.error('Error fetching bien:', error);
    return res.status(500).send('Failed to fetch bien');
  }

  let reservationId;
  try {
    const result = await sequelize.query(
      'INSERT INTO reservation (id_BienImmobilier, id_ClientVoyageur, dateDebut, dateFin, prix, nomBien) VALUES (?, ?, ?, ?, ?, ?)',
      {
        replacements: [id_BienImmobilier, id_Voyageur, dateDebut, dateFin, prixTotal, nomBien],
        type: sequelize.QueryTypes.INSERT
      }
    );
    reservationId = result[0];
  } catch (error) {
    console.error('Error creating reservation:', error);
    return res.status(500).send('Error creating reservation');
  }

  let user;
  try {
    const result = await sequelize.query(
      'SELECT nom, prenom FROM voyageurs WHERE id = ?',
      {
        replacements: [id_Voyageur],
        type: sequelize.QueryTypes.SELECT
      }
    );
    if (result.length === 0) {
      return res.status(404).send('User not found');
    }
    user = result[0]; // Extract user details from the result set
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).send('Failed to fetch user');
  }

  const datePaiement = new Date().toISOString().split('T')[0]; 
  const methodePaiement = 'Stripe'; 
  const statut = 'validé'; 
  const nom = `${user.nom} ${user.prenom}`; 
  const id_Utilisateur = id_Voyageur; 
  const typeUtilisateur = 'voyageurs'; 

  try {
    await sequelize.query(
      'INSERT INTO paiement (id_Reservation, montant, datePaiement, methodePaiement, statut, nom, id_Utilisateur, typeUtilisateur) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [reservationId, prixTotal, datePaiement, methodePaiement, statut, nom, id_Utilisateur, typeUtilisateur],
        type: sequelize.QueryTypes.INSERT
      }
    );
  } catch (error) {
    console.error('Error creating payment:', error);
    return res.status(500).send('Error creating payment');
  }

  res.send('Reservation and payment created');
});


router.put('/reservation', async (req, res) => {
    const { id, dateDebut, dateFin } = req.body;

    const dateDebutFormatted = new Date(dateDebut).toISOString().substring(0, 10);
    const dateFinFormatted = new Date(dateFin).toISOString().substring(0, 10);

    try {

        const [[{ id_BienImmobilier }]] = await sequelize.query(`SELECT id_BienImmobilier FROM reservation WHERE id = ${id}`);

        const [overlappingReservations] = await sequelize.query(`
            SELECT * FROM reservation
            WHERE id_BienImmobilier = ${id_BienImmobilier}
            AND id <> ${id}
            AND (
                (dateDebut <= '${dateDebutFormatted}' AND dateFin >= '${dateDebutFormatted}')
                OR (dateDebut <= '${dateFinFormatted}' AND dateFin >= '${dateFinFormatted}')
                OR (dateDebut >= '${dateDebutFormatted}' AND dateFin <= '${dateFinFormatted}')
            )
        `);

        if (overlappingReservations.length > 0) {
            return res.status(400).json({ success: false, message: 'There is already a reservation for that time period' });
        }

        await sequelize.query(`
            UPDATE reservation SET
            dateDebut = '${dateDebutFormatted}',
            dateFin = '${dateFinFormatted}'
            WHERE id = ${id}
        `, {
            replacements: {
                id,
                dateDebut: dateDebutFormatted,
                dateFin: dateFinFormatted,
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
    const results = await sequelize.query(`
      SELECT r.*, r.id AS Id_reservation, bi.*, cb.nom as bailleurNom, cb.prenom as bailleurPrenom, cb.adresseMail as bailleurMail, i.imagePath
      FROM reservation r
      JOIN bienImo bi ON r.id_BienImmobilier = bi.id 
      JOIN clientsBailleurs cb on bi.id_ClientBailleur = cb.id
      LEFT JOIN bienImoImages i ON bi.id = i.bienImoId
      WHERE id_ClientVoyageur = ${idVoyageur}
    `);

    const reservations = [];
    let currentReservation = null;

    for (const result of results[0]) {
      if (!currentReservation || currentReservation.id !== result.id) {
        currentReservation = {
          id_Reservation: result.Id_reservation,
          id: result.id,
          ville: result.ville,
          adresse: result.adresse,
          id_ClientBailleur: result.id_ClientBailleur,
          prix: result.prix,
          nomBien: result.nomBien,
          description: result.description,
          dateDebut: result.dateDebut,
          dateFin: result.dateFin,
          statutValidation: result.statutValidation,
          disponible: result.disponible,
          typeDePropriete: result.typeDePropriete,
          nombreChambres: result.nombreChambres,
          nombreLits: result.nombreLits,
          nombreSallesDeBain: result.nombreSallesDeBain,
          wifi: result.wifi,
          cuisine: result.cuisine,
          balcon: result.balcon,
          jardin: result.jardin,
          parking: result.parking,
          piscine: result.piscine,
          jaccuzzi: result.jaccuzzi,
          salleDeSport: result.salleDeSport,
          climatisation: result.climatisation,
          bailleurNom: result.bailleurNom,
          bailleurPrenom: result.bailleurPrenom,
          bailleurMail: result.bailleurMail,
          images: []
        };
        reservations.push(currentReservation);
      }

      if (result.imagePath) {
        currentReservation.images.push(result.imagePath);
      }
    }

    console.log(reservations);
    res.send(reservations); 
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).send("Internal server error");
  }
});


router.post("/createEtatDesLieux", async (req, res) => {
  console.log("Creating etat des lieux:", req.body);
  const { id_BienImmobilier, typeEtat, 
    dateEtat,
    etatGeneral, 
    piecesManquantes, 
    dommagesConstates, 
    signatureBailleur, 
    signatureLocataire,
    status } = req.body;
  const { user } = req.session;

  const signatureBailleurValue = signatureBailleur === true ? 1 : signatureBailleur;
  const signatureLocataireValue = signatureLocataire === true ? 1 : signatureLocataire;

  const sanitizedData = [
    xss(id_BienImmobilier),
    xss(user.id), 
    xss(typeEtat),
    xss(dateEtat),
    xss(etatGeneral),
    xss(piecesManquantes),
    xss(dommagesConstates),
    xss(signatureBailleurValue),
    xss(signatureLocataireValue),
    xss(status)
  ];

  console.log("Sanitized data:", sanitizedData);

  const [reservation] = await sequelize.query(
    `SELECT * FROM reservation WHERE id_BienImmobilier = ? AND dateDebut <= NOW() AND dateFin >= NOW()`,
    {
      replacements: [id_BienImmobilier],
      type: sequelize.QueryTypes.SELECT
    }
  );

  if (!reservation) {
    return res.status(400).send("No ongoing reservation found for this property");
  }

  sanitizedData.splice(2, 0, reservation.id);

  try {
    await sequelize.query(
      `INSERT INTO etatDesLieux (id_BienImmobilier,id_Bailleur,id_Reservation,typeEtat, dateEtat, etatGeneral, piecesManquantes, dommagesConstates, signatureBailleur, signatureLocataire, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: sanitizedData,
        type: sequelize.QueryTypes.INSERT
      }
    );
    res.sendStatus(200); 
  } catch (error) {
    console.error("Error creating etat des lieux:", error);
    res.status(500).send("Error creating etat des lieux"); 
  }
});


router.get('/EtatDesLieux', async (req, res) => {
  const { user } = req.session;
  try {
    const results = await sequelize.query(`
      SELECT e.*, b.nomBien, r.dateDebut, r.dateFin
      FROM etatDesLieux e
      JOIN reservation r ON e.id_Reservation = r.id
      JOIN bienImo b ON e.id_BienImmobilier = b.id
      WHERE e.id_Bailleur = ${user.id}
    `);

    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching etat des lieux:', error);
    res.status(500).json({ error: 'An error occurred while fetching etat des lieux' });
  }
});

router.put('/updateEtatDesLieux', async (req, res) => {
  const { id } = req.body;
  const { status } = req.body;
  console.log('Changing etat des lieux status:', id, status);
  try {
    await sequelize.query(
      `UPDATE etatDesLieux SET status = ? WHERE id = ?`,
      {
        replacements: [status, id],
        type: sequelize.QueryTypes.UPDATE
      }
    );
    res.sendStatus(200);
  } catch (error) {
    console.error('Error changing etat des lieux:', error);
    res.status(500).json({ error: 'An error occurred while changing etat des lieux' });
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

router.put("/paiement/:id/pending", async (req, res) => {
  const { id } = req.params;

  console.log("Pending paiement:", id);

  try {
    await sequelize.query(`UPDATE paiement SET statut = 'En attente' WHERE id = ${id}`);
    res.send("Paiement pending");
  }
  catch (error) {
    console.error("Error pending paiement:", error);
    res.status(500).send("Failed to pending paiement");
  }
});

router.post("/paiement", async (req, res) => {
  console.log("Creating paiement:", req.body);
  let { idReservation, nom, datePaiement, methodePaiement, montant, statut } =
    req.body;

  if (!statut) {
    statut = 'En attente';
  }

  let columns = '';
  let values = '';
  let replacements = {};

  if (idReservation) {
    columns += 'id_Reservation, ';
    values += ':idReservation, ';
    replacements.idReservation = idReservation;
  }
  if (nom) {
    columns += 'nom, ';
    values += ':nom, ';
    replacements.nom = nom;
  }
  if (datePaiement) {
    columns += 'datePaiement, ';
    values += ':datePaiement, ';
    replacements.datePaiement = datePaiement;
  }
  if (methodePaiement) {
    columns += 'methodePaiement, ';
    values += ':methodePaiement, ';
    replacements.methodePaiement = methodePaiement;
  }
  if (montant) {
    columns += 'montant, ';
    values += ':montant, ';
    replacements.montant = montant;
  }
  if (statut) {
    columns += 'statut, ';
    values += ':statut, ';
    replacements.statut = statut;
  }

  columns = columns.slice(0, -2);
  values = values.slice(0, -2);

  try {
    await sequelize.query(
      `INSERT INTO paiement (${columns}) VALUES (${values})`,
      {
        replacements: replacements,
        type: sequelize.QueryTypes.INSERT,
      }
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

  let query = `UPDATE paiement SET `;
  if (id_Reservation) query += `id_Reservation = '${id_Reservation}', `;
  if (nom) query += `nom = '${nom}', `;
  if (datePaiement) query += `datePaiement = '${datePaiement}', `;
  if (methodePaiement) query += `methodePaiement = '${methodePaiement}', `;
  if (montant) query += `montant = '${montant}', `;
  if (statut) query += `statut = '${statut}', `;

  query = query.slice(0, -2);

  query += ` WHERE id = ${id}`;

  try {
    await sequelize.query(query);
  } catch (error) {
    console.error("Error modifying paiement:", error);
  }

  res.send("Paiement modified");
});


// GESTION DES REQUETES UTILISATEURS

router.post("/bienDispo", async (req, res) => {
  console.log("route /bienDispo called");
  const {
    ville, arrivee, depart, typeDePropriete, nombreChambres, nombreLits, nombreSallesDeBain,
    prixMin, prixMax, wifi, cuisine, balcon, jardin, parking, piscine, jaccuzzi, salleDeSport, climatisation
  } = req.body;

  let query = `
    SELECT bienImo.id, cheminImg, ville, adresse, prix, nomBien, description, statutValidation, disponible, typeDePropriete,
    nombreChambres, nombreLits, nombreSallesDeBain, wifi, cuisine, balcon, jardin, parking, piscine, jaccuzzi,
    salleDeSport, climatisation, clientsBailleurs.nom as bailleurNom, clientsBailleurs.prenom as bailleurPrenom, bienImoImages.imagePath, clientsBailleurs.id AS bailleurId
    FROM bienImo
    LEFT JOIN bienImoImages ON bienImo.id = bienImoImages.bienImoId
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

  const results = await sequelize.query(query);
  const biens = [];
  let currentBien = null;

  for (const result of results[0]) {
    if (!currentBien || currentBien.id !== result.id) {
      currentBien = {
        id: result.id,
        ville: result.ville,
        adresse: result.adresse,
        id_ClientBailleur: result.bailleurId,
        bailleurNom: result.bailleurNom, 
        bailleurPrenom: result.bailleurPrenom, 
        prix: result.prix,
        nomBien: result.nomBien,
        description: result.description,
        statutValidation: result.statutValidation,
        disponible: result.disponible,
        typeDePropriete: result.typeDePropriete,
        nombreChambres: result.nombreChambres,
        nombreLits: result.nombreLits,
        nombreSallesDeBain: result.nombreSallesDeBain,
        wifi: result.wifi,
        cuisine: result.cuisine,
        balcon: result.balcon,
        jardin: result.jardin,
        parking: result.parking,
        piscine: result.piscine,
        jaccuzzi: result.jaccuzzi,
        salleDeSport: result.salleDeSport,
        climatisation: result.climatisation,
        images: []
      };
      biens.push(currentBien);
    }

    if (result.imagePath) {
      currentBien.images.push(result.imagePath);
    }
  }

  console.log(biens);
  res.send(biens);
});

module.exports = router;


// GESTION DES PRESTATIONS

router.get('/prestationsById', async (req, res) => {
  const { user } = req.session;
  let query = '';

  switch (user.type) {
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
  const { idPrestation } = req.query; 

  try {

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
  const { user } = req.session;
  const { id_BienImmobilier, date, lieux, ville, typeIntervention, nom, description } = req.body; // Extract description from req.body
  console.log('Creating prestation:', req.body);

  let query = '';
  let replacements = {};

  switch (user.type) {
    case 'clientsBailleurs':
      query = `INSERT INTO prestation (id_BienImmobilier, id_ClientBailleur, date, statut, lieux, ville, typeIntervention, nom, description) VALUES (:id_BienImmobilier, :id_ClientBailleur, :date, 'EN ATTENTE', :lieux, :ville, :typeIntervention, :nom, :description)`;
      replacements = { id_BienImmobilier, id_ClientBailleur: user.id, date, lieux, ville, typeIntervention, nom, description };
      break;
    case 'voyageurs':
      query = `INSERT INTO prestation (id_Voyageur, date, statut, lieux, ville, typeIntervention, nom, description) VALUES (:id_Voyageur, :date, 'EN ATTENTE', :lieux, :ville, :typeIntervention, :nom, :description)`;
      replacements = { id_Voyageur: user.id, date, lieux, ville, typeIntervention, nom, description };
      break;
    default:
      res.status(400).send({ error: 'Invalid user type' });
      return;
  }

  await sequelize.query(query, { replacements });
  res.send('Prestation created');
});

router.get('/prestationsEnAttente', async (req, res) => {
  const { user } = req.session;
  let domaine;

  try {
    [domaine] = await sequelize.query(`SELECT Domaine FROM prestataires WHERE id = ${user.id}`); 
  }
  catch (error) {
    console.error('Error fetching prestation:', error);
    res.status(500).send('An error occurred while fetching the data.');
    return; 
  }

  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Set the time to 00:00:00 UTC

    const [prestations] = await sequelize.query(`
      SELECT * 
      FROM prestation 
      WHERE statut = 'EN ATTENTE' 
      AND date >= '${today.toISOString().split('T')[0]}' AND typeIntervention = '${domaine[0].Domaine}'
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

    const [results] = await sequelize.query(`SELECT * FROM prestation WHERE id = ${prestationId}`);
    const updatedPrestation = results[0];

    res.send(updatedPrestation);
  } catch (error) {
    console.error('Error accepting prestation:', error);
    res.status(500).send('Failed to accept prestation');
  }
});

router.put('/updatePrestation', async (req, res) => {
  const { id, statut } = req.body;

  try {
    await sequelize.query(`UPDATE prestation SET statut = '${statut}' WHERE id = ${id}`);
    res.send('Prestation updated');
  } catch (error) {
    console.error('Error updating prestation:', error);
    res.status(500).send('Failed to update prestation');
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

    if (!id_Prestataire || !typeIntervention || !note || !commentaire || !id_Prestation) {
      return res.status(400).json({ error: 'All fields except id_BienImmobilier are required' });
    }

    let query, replacements;

    if (id_BienImmobilier) {
      query = 'INSERT INTO evaluationPrestation (id_BienImmobilier, id_Prestataire, typeIntervention, note, commentaire, id_Prestation) VALUES (?, ?, ?, ?, ?, ?)';
      replacements = [id_BienImmobilier, id_Prestataire, typeIntervention, note, commentaire, id_Prestation];
    } else {
      query = 'INSERT INTO evaluationPrestation (id_Prestataire, typeIntervention, note, commentaire, id_Prestation) VALUES (?, ?, ?, ?, ?)';
      replacements = [id_Prestataire, typeIntervention, note, commentaire, id_Prestation];
    }

    const result = await sequelize.query(query, {
      replacements: replacements,
      type: QueryTypes.INSERT
    });

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

router.get('/evaluations/avis/:prestataireId', async (req, res) => {
  console.log('Route /avis/evaluations/:prestataireId called');
  const { prestataireId } = req.params;

  try {

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
  const { id_sender, id_receiver, type_sender, type_receiver, content } = req.body;
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
      return { ...details[0], type: contact.type_receiver };
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
  const { id_receiver, type_receiver } = req.body; 
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

  switch (user.type) {
    case 'clientsBailleurs':
      query = `INSERT INTO messages (id_sender, id_receiver, type_sender, type_receiver, content) VALUES (:id_sender, :id_receiver, :type_sender, :type_receiver, :content)`;
      replacements = { id_sender: user.id, id_receiver, type_sender: user.type, type_receiver, content };
      break;
    case 'voyageurs':
      query = `INSERT INTO messages (id_sender, id_receiver, type_sender, type_receiver, content) VALUES (:id_sender, :id_receiver, :type_sender, :type_receiver, :content)`;
      replacements = { id_sender: user.id, id_receiver, type_sender: user.type, type_receiver, content };
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

  let query = 'INSERT INTO finances (';
  let values = 'VALUES (';
  let replacements = {};

  if (id_ClientBailleur) {
    query += 'id_ClientBailleur, ';
    values += ':id_ClientBailleur, ';
    replacements.id_ClientBailleur = id_ClientBailleur;
  }
  if (id_Prestataire) {
    query += 'id_Prestataire, ';
    values += ':id_Prestataire, ';
    replacements.id_Prestataire = id_Prestataire;
  }
  if (id_Voyageur) {
    query += 'id_Voyageur, ';
    values += ':id_Voyageur, ';
    replacements.id_Voyageur = id_Voyageur;
  }

  query += 'montant, dateTransaction, type, nomDocument) ';
  values += ':montant, :dateTransaction, :type, :nomDocument)';
  replacements.montant = montant;
  replacements.dateTransaction = dateTransaction;
  replacements.type = type;
  replacements.nomDocument = nomDocument;

  query += values;

  if (!id_ClientBailleur && !id_Prestataire && !id_Voyageur) {
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

  switch (user.type) {
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
  const filePath = path.resolve(__dirname, '..', 'uploads', req.params.file);
  res.download(filePath, req.params.file, (err) => {
    if (err) {
      console.error(`Error downloading file: ${err.message}`);
      res.status(404).send('File not found');
    }
  });
});

// GESTION DES SIGNALEMENTS

router.post('/signalement', async (req, res) => {
    const { user } = req.session;
    let { sujet } = req.body;
    console.log('Creating signalement:', req.body);

    let query = 'INSERT INTO signalement (';
    let values = 'VALUES (';
    let replacements = {};

    switch (user.type) {
        case 'clientsBailleurs':
            query += 'id_ClientBailleur, ';
            values += ':id_ClientBailleur, ';
            replacements.id_ClientBailleur = user.id;
            break;
        case 'voyageurs':
            query += 'id_Voyageur, ';
            values += ':id_Voyageur, ';
            replacements.id_Voyageur = user.id;
            break;
        case 'prestataires':
            query += 'id_Prestataire, ';
            values += ':id_Prestataire, ';
            replacements.id_Prestataire = user.id;
            break;
        default:
            res.status(400).send({ error: 'Invalid user type' });
            return;
    }

    query += 'sujet, statut) ';
    values += ':sujet, :statut)';
    replacements.sujet = sujet;
    replacements.statut = 0; 

    query += values;

    try {
        await sequelize.query(query, { replacements });
        res.status(200).send({ message: 'Signalement created successfully' });
    } catch (error) {
        console.error('Error creating signalement:', error);
        return res.status(500).send('Error creating signalement');
    }
});

router.post('/demandeDomaine', upload.single('file'), async (req, res) => {
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);

  const { user } = req.session;
  const { domaine } = req.body;
  const ID_Prestataire = user.id;
  const cheminDoc = req.file ? req.file.path : null;

  try {
    if (!ID_Prestataire || !domaine) {
      throw new Error('Missing required fields: ID_Prestataire or domaine');
    }

    const [result] = await sequelize.query(
      `INSERT INTO demandeDomaine (ID_Prestataire, domaine, cheminDoc) VALUES (?, ?, ?)`,
      {
        replacements: [ID_Prestataire, domaine, cheminDoc],
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.status(200).json({ message: 'Demande created successfully', demandeDomaineId: result });
  } catch (error) {
    console.error('Error creating demande:', error.message);
    res.status(500).json({ message: 'Error creating demande', error: error.message });
  }
});

router.get('/demandeDomaine', async (req, res) => {
  try {
    const [demandes] = await sequelize.query('SELECT * FROM demandeDomaine');
    res.json(demandes);
  } catch (error) {
    console.error('Error fetching demandes:', error);
    res.status(500).json({ error: 'Failed to fetch demandes' });
  }
}
);

router.post('/handleDemandeDomaine', async (req, res) => {
  const { id, statut } = req.body;
  console.log('Handling demandeDomaine:', req.body);

  try {

      const demandeDomaineResult = await sequelize.query(
          `SELECT * FROM demandeDomaine WHERE ID = ${id}`,
          { type: sequelize.QueryTypes.SELECT }
      );

      if (demandeDomaineResult.length === 0) {
          return res.status(404).send("Demande not found");
      }

      const demandeDomaine = demandeDomaineResult[0];
      const { ID_Prestataire, domaine } = demandeDomaine;

      if (statut === 'valider') {
          const prestataireResult = await sequelize.query(
              `SELECT * FROM prestataires WHERE id = ${ID_Prestataire}`,
              { type: sequelize.QueryTypes.SELECT }
          );

          if (prestataireResult.length === 0) {
              return res.status(404).send("Prestataire not found");
          }

          const prestataire = prestataireResult[0];
          let updatedDomaines = [];

          if (prestataire.domaine) {
              try {
                  updatedDomaines = JSON.parse(prestataire.domaine);
                  if (!Array.isArray(updatedDomaines)) {
                      updatedDomaines = [];
                  }
              } catch (error) {
                  updatedDomaines = [];
              }
          }

          if (!updatedDomaines.includes(domaine)) {
              updatedDomaines.push(domaine);
          }

          await sequelize.query(
              `UPDATE prestataires SET domaine = '${JSON.stringify(updatedDomaines)}' WHERE id = ${ID_Prestataire}`
          );
      }

      await sequelize.query(
          `DELETE FROM demandeDomaine WHERE ID = ${id}`
      );

      res.send("Demande handled successfully");
  } catch (error) {
      console.error("Error handling demandeDomaine:", error);
      res.status(500).send("Error handling demandeDomaine");
  }
});
