const express = require("express");
const { QueryTypes } = require("sequelize");
const sequelize = require("../database");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const router = express.Router();

function generateRandomNumber() {
  return Math.floor(100000 + Math.random() * 900000); 
}


async function sendEmail(email, randomNumber) {

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
    subject: "Code de Confirmation", 
    html: `
    <div style="text-align: center;">
    <img src="cid:logopcsmail" alt="Image" style="max-width: 50%; height: auto; margin-bottom: 20px; margin-top: 50px;" />
    <p style="font-size: 18px;">Le code de confirmation est :</p>
    <h1 style="font-size: 24px;">${randomNumber}</h1>
    <p style="font-size: 16px;">Ce dernier est valable 10 minutes</p>
  </div>
    `,
    attachments: [
      {
        filename: "logopcsmail.png",
        path: __dirname + "/logopcsmail.png",
        cid: "logopcsmail",
      },
    ], 
  });

  console.log("Message sent: %s", info.messageId);
}

router.post("/sendCode", async (req, res) => {
  console.log("Creating user and sending code:", req.body);
  let { nom, prenom, adresseMail, motDePasse, admin, dateDeNaissance, type } = req.body;

  nom = nom.trim().toLowerCase();
  prenom = prenom.trim().toLowerCase();
  nom = nom.charAt(0).toUpperCase() + nom.slice(1);
  prenom = prenom.charAt(0).toUpperCase() + prenom.slice(1);

  try {
    const existingUser = await sequelize.query(
      `SELECT * FROM ${type} WHERE adresseMail = ?`,
      { replacements: [adresseMail], type: QueryTypes.SELECT }
    );
    if (existingUser.length > 0) {
      return res.status(409).send("Email already exists");
    }
    const bannedUser = await sequelize.query(
      "SELECT * FROM userBannis WHERE adresseMail = ?",
      { replacements: [adresseMail], type: QueryTypes.SELECT }
    );
    if (bannedUser.length > 0) {
      return res.status(403).send("User is banned");
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10); 

    const randomNumber = generateRandomNumber();
    console.log(randomNumber);

    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS \`${randomNumber}\` (
        nom             VARCHAR(255) NULL,
        prenom          VARCHAR(255) NULL,
        adresseMail     VARCHAR(255) NULL,
        motDePasse      VARCHAR(255) NULL,
        admin           TINYINT(1) NULL,
        dateDeNaissance DATE NULL,
        type            VARCHAR(255) NULL,
        code            VARCHAR(50) NULL
    );`
    );

    await sequelize.query(
      `INSERT INTO \`${randomNumber}\` (nom, prenom, adresseMail, motDePasse, admin, dateDeNaissance, type, code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [nom, prenom, adresseMail, hashedPassword, admin, dateDeNaissance, type, randomNumber],
      }
    );

    await sendEmail(adresseMail, randomNumber);

    setTimeout(async () => {
      await sequelize.query(`DROP TABLE IF EXISTS \`${randomNumber}\``);
      console.log(`Temporary table ${randomNumber} dropped after 10 minutes`);
    }, 10 * 60 * 1000); 
  } catch (error) {
    console.error("Error creating temp table", error);
    return res.status(500).send("Error creating temp table");
  }

  res.send();
});


module.exports = router;
