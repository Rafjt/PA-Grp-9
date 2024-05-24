const express = require("express");
const { QueryTypes } = require("sequelize");
const sequelize = require("../database");
const router = express.Router();
const { STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY } = require('../credsStripe.js');
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const URL = 'http://localhost:3000';

module.exports = router;
