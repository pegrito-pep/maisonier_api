'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Logements extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.Logements.belongsTo(models.Utilisateurs, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: true,
                    name: 'idUtilisateur'
                }
            })
            models.Logements.belongsTo(models.Entreprises, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: true,
                    name: 'idEntreprise'
                }
            })
            models.Logements.belongsTo(models.Batiments, {
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                foreignKey: {
                    allowNull: true,
                    name: 'idBatiment'
                },
                as: 'batiment'
            })
            models.Logements.belongsTo(models.SousTypesLogements, {
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                foreignKey: {
                    allowNull: false,
                    name: 'idSousType'
                },
                as: 'sousTypeLogement'
            })
            models.Logements.hasMany(models.Photos, {
                foreignKey: {
                    allowNull: false,
                    name: 'idLogement'
                },
                as: 'photos'
            })
            models.Logements.hasOne(models.Adresses, {
                foreignKey: {
                    allowNull: true,
                    name: 'idLogement'
                },
                as: 'adresse'
            })
            models.Logements.hasMany(models.CaracteristiquesLogements, {
                foreignKey: {
                    allowNull: false,
                    name: 'idLogement'
                },
                as: 'caracteristiques'
            })

            models.Logements.hasMany(models.Annonces, {
                foreignKey: {
                    allowNull: false,
                    name: 'idLogement',
                },
                as: 'annonces'
            })
            models.Logements.hasMany(models.Occupations, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idLogement'
                },
                as: 'occupations'
            })
            models.Logements.hasMany(models.Depenses, {
                onDelete: 'CASCADE',
                onUpdate: 'SET NULL',
                foreignKey: {
                    allowNull: true,
                    name: 'idLogement'
                },
                as: 'depenses'
            })

            models.Logements.belongsTo(models.ModelesContrats, {
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
                foreignKey: {
                    allowNull: true,
                    name: 'idModele'
                },
                as: 'modeleContrat'
            })

            models.Logements.hasMany(models.Indexes, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idLogement'
                },
                as: 'indexes'
            })
        }
    };
    Logements.init({
        idLogement: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        idUtilisateur: DataTypes.UUID,
        idEntreprise: DataTypes.INTEGER,
        idModele: DataTypes.INTEGER,
        idSousType: DataTypes.INTEGER,
        idBatiment: DataTypes.INTEGER,
        refLogement: { type: DataTypes.STRING, allowNull: false },
        descLogement: DataTypes.STRING,
        prixMin: { type: DataTypes.INTEGER, allowNull: false },
        prixMax: { type: DataTypes.INTEGER, allowNull: false },
        etatLogement: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        statutLogement: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, {
        sequelize,
        modelName: 'Logements',
    });
    return Logements;
};