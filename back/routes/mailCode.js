const express = require("express");
const { QueryTypes } = require("sequelize");
const sequelize = require("../database");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const router = express.Router();
// const mailCodeRouter = express.Router();

// Function to generate a random 6-digit number
function generateRandomNumber() {
  return Math.floor(100000 + Math.random() * 900000); // Generates a random number between 100000 and 999999
}

// Function to send email
async function sendEmail(email, randomNumber) {
  // Create a transporter using SMTP
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL
    auth: {
      user: "pcsnoreply75@gmail.com",
      pass: "bzurcpscdivqgaik",
    },
  });

  // Send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Paris Caretaker Services" <pcsnoreply75@gmail.com>', // Sender address
    to: email, // List of recipients
    subject: "Code de Confirmation", // Subject line
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
    ], // HTML body
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

    // Hash the password
    const hashedPassword = await bcrypt.hash(motDePasse, 10); // 10 is the number of salt rounds

    // Generate a random 6-digit number
    const randomNumber = generateRandomNumber();
    console.log(randomNumber);

    // Create a temporary table with the random number as the table name
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

    // Insert the user data into the temporary table using parameterized query
    await sequelize.query(
      `INSERT INTO \`${randomNumber}\` (nom, prenom, adresseMail, motDePasse, admin, dateDeNaissance, type, code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [nom, prenom, adresseMail, hashedPassword, admin, dateDeNaissance, type, randomNumber],
      }
    );

    // Send email with the confirmation code
    await sendEmail(adresseMail, randomNumber);

    // Schedule dropping of the temporary table after 10 minutes
    setTimeout(async () => {
      await sequelize.query(`DROP TABLE IF EXISTS \`${randomNumber}\``);
      console.log(`Temporary table ${randomNumber} dropped after 10 minutes`);
    }, 10 * 60 * 1000); // 10 seconds in milliseconds
  } catch (error) {
    console.error("Error creating temp table", error);
    return res.status(500).send("Error creating temp table");
  }

  res.send();
});


module.exports = router;
