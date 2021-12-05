'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Comptes extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Comptes.belongsTo(models.Occupations, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idOccupation'
                },
                as: 'occupation'
            })

            models.Comptes.hasMany(models.Depots, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idCompte'
                },
                as: 'depots'
            })
        }
    };
    Comptes.init({
        idCompte: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        idOccupation: DataTypes.INTEGER,
        typeCompte: { type: DataTypes.STRING, allowNull: false },
        solde: { type: DataTypes.INTEGER, defaultValue: 0 }
    }, {
        sequelize,
        modelName: 'Comptes',
    });
    return Comptes;
};