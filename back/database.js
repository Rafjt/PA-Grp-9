const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    'PCS',
    'root',
    '5318008.Db',
     {
       host: 'localhost',
       dialect: 'mysql'
     }
);

module.exports = sequelize;