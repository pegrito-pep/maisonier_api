'use strict';
const { Model } = require('sequelize');
const { baseUrl } = require('../config/env')
const { empty } = require('php-in-js')

module.exports = (sequelize, DataTypes) => {
    class Batiments extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.Batiments.belongsTo(models.Cites, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idCite'
                },
                as: 'cite'
            })
            models.Batiments.hasMany(models.Logements, {
                onDelete: 'CASCADE',
                onUpdate: 'SET NULL',
                foreignKey: {
                    allowNull: true,
                    name: 'idBatiment'
                }
            })
            models.Batiments.hasMany(models.Depenses, {
                onDelete: 'CASCADE',
                onUpdate: 'SET NULL',
                foreignKey: {
                    allowNull: true,
                    name: 'idBatiment'
                },
                as: 'depenses'
            })
            models.Batiments.hasOne(models.Adresses, {
                foreignKey: {
                    allowNull: true,
                    name: 'idBatiment'
                },
                as: 'adresse'
            })
        }
    };
    Batiments.init({
        idBatiment: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        idCite: DataTypes.INTEGER,
        nomBatiment: { type: DataTypes.STRING, allowNull: false },
        refBatiment: { type: DataTypes.STRING, allowNull: false },
        image: { 
            type: DataTypes.STRING, allowNull: true,
            get() {
                const rawValue = this.getDataValue('image');
                if (empty(rawValue)) {
                    return rawValue
                }
                return `${baseUrl.replace('/api', '')}/api/static/${rawValue.split('static/')[1]}`
            }
        },
        statutBatiment: { type: DataTypes.BOOLEAN, defaultValue: true },
    }, {
        sequelize,
        modelName: 'Batiments',
    });

    /**
     * Associations
     */



    return Batiments;
};