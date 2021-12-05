'use strict';

const { Model } = require('sequelize');
const { baseUrl } = require('../config/env')
const { empty } = require('php-in-js')

module.exports = (sequelize, DataTypes) => {
    class Cites extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Cites.belongsTo(models.Utilisateurs, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idUtilisateur'
                }
            })

            models.Cites.hasMany(models.Batiments, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idCite'
                },
                as: 'batiments'
            })

            models.Cites.hasMany(models.Depenses, {
                onDelete: 'CASCADE',
                onUpdate: 'SET NULL',
                foreignKey: {
                    allowNull: true,
                    name: 'idCite'
                },
                as: 'depenses'
            })
        }
    };
    Cites.init({
        idCite: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        idUtilisateur: DataTypes.UUID,
        nomCite: { type: DataTypes.STRING, allowNull: false },
        refCite: { type: DataTypes.STRING, allowNull: false },
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
        statutCite: { type: DataTypes.BOOLEAN, defaultValue: true },
    }, {
        sequelize,
        modelName: 'Cites',
    });
    return Cites;
};