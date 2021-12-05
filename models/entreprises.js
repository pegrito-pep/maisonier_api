'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Entreprises extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            models.Entreprises.hasMany(models.Logements, {
                foreignKey: {
                    allowNull: true,
                    name: 'idEntreprise'
                }
            })

            models.Entreprises.belongsToMany(models.Utilisateurs, {
                foreignKey: 'idEntreprise',
                otherKey: 'idUtilisateur',
                through: models.Roles
            })
        }
    };
    Entreprises.init({
        idEntreprise: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        raisonSociale: { type: DataTypes.STRING, allowNull: false },
        siegeSocial: { type: DataTypes.STRING, allowNull: false },
        registreCommerce: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false },
        logo: { type: DataTypes.STRING, allowNull: true },
        dateCreation: { type: DataTypes.DATE, allowNull: false }
    }, {
        sequelize,
        modelName: 'Entreprises',
    });
    return Entreprises;
};