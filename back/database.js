const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    'PCST',
    'root',
    '1234.Azerty',
     {
       host: 'localhost',
       dialect: 'mysql'
     }
);

module.exports = sequelize;
