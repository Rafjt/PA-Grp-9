const express = require("express");
const sequelize = require("../database");
const router = express.Router();
const bcrypt = require("bcrypt");

router.post("/login", async (req, res) => {
  console.log("route /login called", req.body);
  const { email, password, type } = req.body;

  try {
    const response = await sequelize.query(
      `SELECT * FROM ${type} WHERE adresseMail = '${email}'`
    );
    const userBanned = await sequelize.query(
      `SELECT * FROM userBannis WHERE adresseMail = '${email}'`
    );
    if (userBanned[0].length > 0) {
      res.status(409).send("UserBanned");
      console.log("User is Banned");

    } else if (response[0].length > 0) {
      const user = response[0][0];
      const hashedPasswordFromDB = user.motDePasse;
      console.log("hashedPasswordFromDB", hashedPasswordFromDB);
      console.log("password", password);

      const match = await bcrypt.compare(password, hashedPasswordFromDB); // Use bcrypt.compare()

      if (match) {

        req.session.user = {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          adresseMail: user.adresseMail,
          dateDeNaissance: user.dateDeNaissance,
          admin: user.admin,
          type: type,
        };
        res.json(req.session.user); 
      } else if (!match) {
        res.status(403).send("WrongPWD");
        console.log("WrongPWD");
      }
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.send("Logged out");
});

router.get("/me", (req, res) => {
  console.log(req.session);
  res.send(req.session.user);
});

router.put("/updateCookie", async (req, res) => {
    const { userId, userType, userData } = req.body;
    console.log(userData);
    console.log("updating the cookie");
  
    try {
      // Update the session or cookie data with the new user data
      req.session.user = {
        id: userId,
        nom: userData.nom,
        prenom: userData.prenom,
        adresseMail: userData.adresseMail,
        dateDeNaissance: userData.dateDeNaissance,
        admin: userData.admin,
        type: userType,
      };
      // Respond with success message
      res.status(200).json({ message: "Cookie updated successfully" });
    } catch (error) {
      console.error("Error updating cookie:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = router;
