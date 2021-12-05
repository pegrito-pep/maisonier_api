'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Fonctionnalites extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            models.Fonctionnalites.belongsToMany(models.Formules, {
                foreignKey: 'idFonctionnalite',
                otherKey: 'idFormule',
                through: models.FonctionnalitesFormules
            })
        }
    };
    Fonctionnalites.init({
        idFonctionnalite: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        libelle: { type: DataTypes.STRING, allowNull: false },
    }, {
        sequelize,
        modelName: 'Fonctionnalites',
    });
    return Fonctionnalites;
};