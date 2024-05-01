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

        if (response[0].length > 0) {
            const user = response[0][0];
            const hashedPasswordFromDB = user.motDePasse;
            console.log("hashedPasswordFromDB",hashedPasswordFromDB);
            console.log("password",password);

            const match = await bcrypt.compare(password, hashedPasswordFromDB); // Use bcrypt.compare()

            if (match) {
                // Store the user's information in the session
                req.session.user = {
                    id: user.id,
                    nom: user.nom,
                    prenom: user.prenom,
                    adresseMail: user.adresseMail,
                    dateDeNaissance: user.dateDeNaissance,
                    admin: user.admin
                };
                // console.log("LA",req.session.user); // Add this line
                // res.send("Logged in");
                res.cookie('admin', user.admin); // Set cookies before sending the response
                res.cookie('id', user.id);
                res.cookie('type', type);
                res.json(req.session.user); // Send the response
            }else {
                res.status(401).send("Unauthorized");
                console.log("Unauthorized");
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

module.exports = router;
