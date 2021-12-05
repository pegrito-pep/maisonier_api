'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Occupations extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.Occupations.belongsTo(models.Logements, {
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                foreignKey: {
                    allowNull: false,
                    name: 'idLogement'
                },
                as: 'logement'
            })

            models.Occupations.belongsTo(models.Locataires, {
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                foreignKey: {
                    allowNull: false,
                    name: 'idLocataire'
                },
                as: 'locataire'
            })

            models.Occupations.hasOne(models.Contrats, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idOccupation'
                },
                as: 'contrat'
            })

            models.Occupations.hasMany(models.Comptes, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idOccupation'
                },
                as: 'comptes'
            })

            models.Occupations.hasMany(models.Charges, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idOccupation'
                },
                as: 'charges'
            })

            models.Occupations.hasMany(models.Loyers, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idOccupation'
                },
                as: 'loyers'
            })

            models.Occupations.hasMany(models.Indexes, {
                onDelete: 'SET NULL',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: true,
                    name: 'idOccupation'
                },
                as: 'indexes'
            })
        }
    }

    Occupations.init({
        idOccupation: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        idLogement: DataTypes.INTEGER,
        idLocataire: DataTypes.INTEGER,
        loyerBase: { type: DataTypes.INTEGER, allowNull: false },
        caution: { type: DataTypes.INTEGER, defaultValue: 0 },
        modePaiement: { type: DataTypes.STRING, allowNull: false },
        dateDeb: DataTypes.DATE,
        dateFin: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
        modeEnergie: { type: DataTypes.ENUM('forfait', 'index'), allowNull: false },
        modeEau: { type: DataTypes.ENUM('forfait', 'index'), allowNull: false },
        puEnergie: { type: DataTypes.INTEGER, allowNull: false },
        puEau: { type: DataTypes.INTEGER, allowNull: false },
        dureeBail: { type: DataTypes.INTEGER },
    }, {
        updatedAt: false,
        sequelize,
        modelName: 'Occupations',
    })

    return Occupations
};