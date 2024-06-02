require('dotenv').config();

console.log('Database:', process.env.PCS_DB_NAME);
console.log('User:', process.env.PCS_DB_USER);
console.log('Password:', process.env.PCS_DB_PASSWORD);
console.log('Host:', process.env.PCS_DB_HOST);

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.PCS_DB_NAME, // database name
  process.env.PCS_DB_USER, // username
  process.env.PCS_DB_PASSWORD, // password
  {
    host: process.env.PCS_DB_HOST,
    dialect: 'mysql'
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
