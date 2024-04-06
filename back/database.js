const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    'PCStest1',
    'romain',
    'budz5subzYk&',
     {
       host: '51.83.76.159',
       dialect: 'mysql'
     }
);

module.exports = sequelize;
