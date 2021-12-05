'use strict';

const { empty } = require('php-in-js')
const { baseUrl } = require('../config/env')

const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Locataires extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Locataires.belongsTo(models.Utilisateurs, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: true,
                    name: 'idUtilisateur'
                },
                as: 'habitant'
            })

            models.Locataires.belongsTo(models.Utilisateurs, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idBailleur'
                },
                as: 'bailleur'
            })

            models.Locataires.hasMany(models.Occupations, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: true,
                    name: 'idLocataire'
                },
                as: 'occupations'
            })
        }
    };
    Locataires.init({
        idLocataire: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        idUtilisateur: DataTypes.UUID,
        idBailleur: DataTypes.UUID,
        nomLocataire: { type: DataTypes.STRING, allowNull: false },
        prenomLocataire: DataTypes.STRING,
        cniLocataire: DataTypes.STRING,
        tel: { type: DataTypes.STRING, allowNull: false },
        tel2: DataTypes.STRING,
        tel3: DataTypes.STRING,
        tel4: DataTypes.STRING,
        email: DataTypes.STRING,
        email2: DataTypes.STRING,
        avatar: {
            type: DataTypes.STRING,
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('avatar');
                if (empty(rawValue)) {
                    return `${baseUrl.replace('/api', '')}/api/static/avatars/default.jpg`
                }
                return `${baseUrl.replace('/api', '')}/api/static/${rawValue.split('static/')[1]}`
            }
        },
        titre: DataTypes.STRING,
        profession: DataTypes.STRING,
        dateNaiss: DataTypes.DATE,
        lieuNaiss: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Locataires',
    });

    return Locataires;
};