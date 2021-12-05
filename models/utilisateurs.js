'use strict';

const { empty } = require('php-in-js')
const { baseUrl } = require('../config/env')

const { Model, Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Utilisateurs extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Utilisateurs.hasMany(models.Locataires, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idUtilisateur'
                }
            })
            models.Utilisateurs.hasMany(models.Locataires, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idBailleur'
                }
            })

            models.Utilisateurs.hasMany(models.Articles, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idUtilisateur'
                }
            })
            models.Utilisateurs.hasMany(models.ModelesContrats, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idUtilisateur'
                },
                as: 'modelesContrat'
            })

            models.Utilisateurs.belongsToMany(models.Entreprises, {
                foreignKey: 'idUtilisateur',
                otherKey: 'idEntreprise',
                through: models.Roles
            })

            models.Utilisateurs.hasMany(models.Propositions, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idUtilisateur',
                    as: 'propositions'
                }
            })

            models.Utilisateurs.hasOne(models.Profils, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idUtilisateur'
                },
                as: 'profil'
            })
            models.Utilisateurs.hasOne(models.Preferences, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idUtilisateur'
                },
                as: 'preferences'
            })
        }
    };
    Utilisateurs.init({
        idUtilisateur: { type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.UUIDV4 },
        nom: { type: DataTypes.STRING, allowNull: false },
        prenom: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        tel: { type: DataTypes.STRING, allowNull: false, unique: true },
        code: { type: DataTypes.STRING, allowNull: false, unique: true },
        mdp: { type: DataTypes.STRING, allowNull: false },
        genre: { type: DataTypes.STRING, allowNull: false },
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
        provider: { type: DataTypes.STRING, defaultValue: 'local' },
        dateNaiss: DataTypes.DATEONLY,
        isCertified: { type: DataTypes.BOOLEAN, defaultValue: false },
        statutUtilisateur: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, {
        sequelize,
        modelName: 'Utilisateurs',
    });
    return Utilisateurs;
};