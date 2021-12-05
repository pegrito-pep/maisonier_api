'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Depots extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Depots.belongsTo(models.Comptes, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idCompte'
                },
                as: 'compte'
            })
        }
    };
    Depots.init({
        idDepot: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        idCompte: DataTypes.INTEGER,
        montant: { type: DataTypes.INTEGER, allowNull: false },
        description: DataTypes.TEXT,
        dateDepot: { type: DataTypes.DATE, allowNull: false}
    }, {
        timestamps: false,
        sequelize,
        modelName: 'Depots',
    });
    return Depots;
};