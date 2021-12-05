'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Formules extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            models.Formules.belongsToMany(models.Fonctionnalites, {
                foreignKey: 'idFormule',
                otherKey: 'idFonctionnalite',
                through: models.FonctionnalitesFormules
            })
        }
    };
    Formules.init({
        idFormule: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        nomFormule: { type: DataTypes.STRING, allowNull: false},
        prix: { type: DataTypes.INTEGER, defaultValue: 0 }
    }, {
        sequelize,
        modelName: 'Formules',
    });
    return Formules;
};