const express = require("express");
const router = express.Router();
const { STRIPE_SECRET_KEY } = require('../credsStripe.js');
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");
const sequelize = require("../database");
const URL = process.env.PCS_URL;

async function sendEmail(email, nom, prenom) {

    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, 
      auth: {
        user: "pcsnoreply75@gmail.com",
        pass: "bzurcpscdivqgaik",
      },
    });
  
    let info = await transporter.sendMail({
      from: '"Paris Caretaker Services" <pcsnoreply75@gmail.com>', 
      to: email, 
      subject: "Confirmation d'inscription", 
      html: `
      <div style="text-align: center;">
      <p style="font-size: 18px;">${prenom} ${nom}, vous avez choisi de vous abonnez à nos services, et nous vous remercions.</p>
      <h1 style="font-size: 24px;"></h1>
      <p style="font-size: 16px;"></p>
    </div>
      `
    });
  
    console.log("Message sent: %s", info.messageId);
  }

const priceIds = {
  'Bag_Packer_monthly': "price_1PJxTcRxWnuK618zA6IEpkDt",
  'Bag_Packer_annual': "price_1PJxV1RxWnuK618z8FbCXat4",
  'Explorator_monthly': "price_1PJxW6RxWnuK618zCBZvg8zp",
  'Explorator_annual': "price_1PJxZ2RxWnuK618zP4EQI6Iz"
};

router.post("/create-abonnement-session", async (req, res) => {
    const { typeAbonnement, userId } = req.body;
    const pId = priceIds[typeAbonnement];
  
    if (!pId) {
      return res.status(400).send({ error: 'Invalid abonnement type.' });
    }

    console.log(userId, typeAbonnement);
  
    try {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: pId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        client_reference_id: userId,
        success_url: `${URL}/paiementAbonnement?success=true`,
        cancel_url: `${URL}/paiementAbonnement?canceled=true`,
        metadata: { userId, typeAbonnement }
      });
  
      res.json({ url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).send({ error: 'An error occurred while creating the checkout session.' });
    }
  });
  
router.post("/insert-abonnement-info", async (req, res) => {
  const { typeAbonnement, userId, userType, price } = req.body;

  const idProduitStripe = priceIds[typeAbonnement];

  if (!idProduitStripe) {
    return res.status(400).send({ error: 'Invalid abonnement type.' });
  }

  const formatDate = (date) => date.toISOString().split('T')[0];

  const dateDebut = new Date();
  const typeEcheance = typeAbonnement.includes('monthly') ? 'mensuel' : 'annuel';
  const dateRenouvellement = new Date(dateDebut);
  if (typeEcheance === 'mensuel') {
    dateRenouvellement.setMonth(dateDebut.getMonth() + 1);
  } else {
    dateRenouvellement.setFullYear(dateDebut.getFullYear() + 1);
  }

  const formattedDateDebut = formatDate(dateDebut);
  const formattedDateRenouvellement = formatDate(dateRenouvellement);

  try {
    await sequelize.query(
      'INSERT INTO abonnement (id_Voyageur, type, dateDebut, dateRenouvellement, idProduitStripe, statut, typeEcheance) VALUES (?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [userId, typeAbonnement, formattedDateDebut, formattedDateRenouvellement, idProduitStripe, 'actif', typeEcheance],
        type: sequelize.QueryTypes.INSERT
      }
    );
    console.log('Abonnement inserted successfully');
  } catch (error) {
    console.error('Error inserting abonnement into database:', error);
    return res.status(500).send({ error: 'Failed to insert abonnement into database.' });
  }

  try {

    const [user] = await sequelize.query(
      'SELECT nom, prenom, adresseMail FROM voyageurs WHERE id = ?',
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!user) {
      return res.status(404).send({ error: 'User not found.' });
    }

    const { nom, prenom, adresseMail } = user;
    const userNomComplet = `${prenom} ${nom}`;
    const datePaiement = formatDate(new Date());
    const methodePaiement = 'Stripe';  

    await sequelize.query(
      'INSERT INTO paiement (id_Utilisateur, typeUtilisateur, nom, datePaiement, methodePaiement, montant, statut) VALUES (?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [userId, userType, userNomComplet, datePaiement, methodePaiement, price, 'validé'],
        type: sequelize.QueryTypes.INSERT
      }
    );
    
    console.log(adresseMail);
    await sendEmail(adresseMail, nom, prenom);

    console.log('Payment inserted successfully');
    res.sendStatus(200);
  } catch (error) {
    console.error('Error inserting payment into database:', error);
    res.status(500).send({ error: 'Failed to insert payment into database.' });
  }

});

router.get("/check-abonnement", async (req, res) => {
    const { userId } = req.query; 
    try {
      const abonnement = await sequelize.query(
        `SELECT v.nom, v.prenom, v.adresseMail, a.* 
         FROM voyageurs v
         LEFT JOIN abonnement a ON v.id = a.id_Voyageur
         WHERE v.id = ? AND a.statut = 'actif'`,
        {
          replacements: [userId],
          type: sequelize.QueryTypes.SELECT
        }
      );
  
      if (abonnement && abonnement.length > 0) {
        if (abonnement[0].dateFin) {
          const dateToday = new Date();
          const dateFin = new Date(abonnement[0].dateFin);
  
          console.log('dateFin:', dateFin);
          console.log('dateToday:', dateToday);
          console.log(abonnement[0].statut);
  
          if (dateFin <= dateToday && abonnement[0].statut !== 'inactif') {
            await sequelize.query(
              `UPDATE abonnement SET statut = 'inactif' WHERE id_Voyageur = ?`,
              {
                replacements: [userId],
                type: sequelize.QueryTypes.UPDATE
              }
            );
            console.log(`L'abonnement de l'utilisateur ${userId} est désormais inactif`);
          } else {
            console.log(`L'abonnement de l'utilisateur ${userId} est toujours actif`);
          }
        }
  
        const abonnementExists = abonnement.some(ab => ab.statut === 'actif');
        return res.status(200).send({ abonnementExists, abonnements: abonnement });
      } else {
        return res.status(200).send({ abonnementExists: false, abonnements: [] });
      }
    } catch (error) {
      console.error('Error fetching abonnement info', error);
      res.status(500).send({ error: 'Failed to fetch abonnement info' });
    }
  });

  router.put("/resilierAbonnement", async (req, res) => {
    const { userId } = req.body;
  
    console.log("Resiliation abonnement:", userId);
  
    try {
      await sequelize.query(`Update abonnement set statut = "inactif" where id_Voyageur = ${userId}`);
      res.json.send("Abonnement résilié");
    } catch (error) {
      console.error("Error dans la résiliation", error);
      res.status(500).send("Erreur 500");
    }
  });
  

module.exports = router;
