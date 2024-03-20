const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    'PCS',
    'root',
    '1234.Azerty',
     {
       host: 'localhost',
       dialect: 'mysql'
     }
);

module.exports = sequelize;