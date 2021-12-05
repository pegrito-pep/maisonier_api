'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Roles extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.Utilisateurs.belongsToMany(models.Entreprises, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                through: models.Roles,
                foreignKey: 'idUtilisateur',
                otherKey: 'idEntreprise'
            })

            models.Entreprises.belongsToMany(models.Utilisateurs, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                through: models.Roles,
                foreignKey: 'idEntreprise',
                otherKey: 'idUtilisateur'
            })

            models.Roles.belongsTo(models.Utilisateurs, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idUtilisateur'
                },
                as: 'utilisateur',
            })

            models.Roles.belongsTo(models.Entreprises, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idEntreprise'
                },
                as: 'entreprise',
            })
        }
    };
    Roles.init({
        idUtilisateur: DataTypes.UUID,
        idEntreprise: DataTypes.INTEGER,
        role: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Roles',
    });
    return Roles;
};