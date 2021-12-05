'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Propositions extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.Propositions.belongsTo(models.Annonces, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idAnnonce',
                },
                as: 'annonce'
            })

            models.Propositions.belongsTo(models.Utilisateurs, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idUtilisateur',
                },
                as: 'utilisateur'
            })
        }
    }

    Propositions.init({
        idProposition: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        idAnnonce: DataTypes.UUID,
        idUtilisateur: DataTypes.UUID,
        proposition: { type: DataTypes.TEXT, allowNull: false },
        approuver: { type: DataTypes.BOOLEAN, defaultValue: false },
    }, {
        sequelize,
        modelName: 'Propositions',
    })

    return Propositions
};