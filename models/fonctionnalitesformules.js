'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class FonctionnalitesFormules extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.Formules.belongsToMany(models.Fonctionnalites, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                through: models.FonctionnalitesFormules,
                foreignKey: 'idFormule',
                otherKey: 'idFonctionnalite'
            })

            models.Fonctionnalites.belongsToMany(models.Formules, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                through: models.FonctionnalitesFormules,
                foreignKey: 'idFonctionnalite',
                otherKey: 'idFormule'
            })

            models.FonctionnalitesFormules.belongsTo(models.Formules, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idFormule'
                },
                as: 'formule',
            })

            models.FonctionnalitesFormules.belongsTo(models.Fonctionnalites, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idFonctionnalite'
                },
                as: 'fonctionnalite',
            })
        }
    };
    FonctionnalitesFormules.init({
        idFormule: DataTypes.INTEGER,
        idFonctionnalite: DataTypes.INTEGER,
    }, {
        timestamps: false,
        sequelize,
        modelName: 'FonctionnalitesFormules',
    });

    return FonctionnalitesFormules;
};