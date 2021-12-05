'use strict';
const { Model } = require('sequelize');
const { baseUrl } = require('../config/env')
const { empty } = require('php-in-js')

module.exports = (sequelize, DataTypes) => {
    class Depenses extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.Depenses.belongsTo(models.Cites, {
                onDelete: 'CASCADE',
                onUpdate: 'SET NULL',
                foreignKey: {
                    allowNull: true,
                    name: 'idCite'
                },
                as: 'cite'
            })
            models.Depenses.belongsTo(models.Batiments, {
                onDelete: 'CASCADE',
                onUpdate: 'SET NULL',
                foreignKey: {
                    allowNull: true,
                    name: 'idBatiment'
                },
                as: 'batiment'
            })
            models.Depenses.belongsTo(models.Logements, {
                onDelete: 'CASCADE',
                onUpdate: 'SET NULL',
                foreignKey: {
                    allowNull: true,
                    name: 'idLogement'
                },
                as: 'logement'
            })
        }
    }

    Depenses.init({
        idDepense: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        numero: { type: DataTypes.STRING, allowNull: false, unique: true },
        idCite: DataTypes.INTEGER,
        idBatiment: DataTypes.INTEGER,
        idLogement: DataTypes.INTEGER,
        motif: DataTypes.TEXT,
        dateDepense: { type: DataTypes.DATEONLY, allowNull: false },
        montant: { type: DataTypes.FLOAT, allowNull: false },
        photo: { 
            type: DataTypes.STRING, allowNull: true,
            get() {
                const rawValue = this.getDataValue('photo');
                if (empty(rawValue)) {
                    return rawValue
                }
                return `${baseUrl.replace('/api', '')}/api/static/${rawValue.split('static/')[1]}`
            }
        },
        observation: DataTypes.TEXT,
        nomResponsable: DataTypes.STRING,
    }, {
        updatedAt: false,
        sequelize,
        modelName: 'Depenses',
    })

    return Depenses
};