'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Charges extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Charges.belongsTo(models.TypesCharges, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idTypeCharge'
                },
                as: 'typeCharge'
            })

            models.Charges.belongsTo(models.Occupations, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idOccupation'
                },
                as: 'occupation'
            })
        }
    };
    Charges.init({
        idCharge: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        idOccupation: DataTypes.INTEGER,
        idTypeCharge: DataTypes.INTEGER,
        montant: { type: DataTypes.INTEGER, allowNull: false },
        montantPayer: {type: DataTypes.INTEGER, defaultValue: 0 },
        periode: { type: DataTypes.DATEONLY, allowNull: false },
        observation: DataTypes.STRING,
        reference: { type: DataTypes.STRING, allowNull: false },
        etatCharge: {type: DataTypes.BOOLEAN, defaultValue: true},
    }, {
        timestamps: false,
        sequelize,
        modelName: 'Charges',
    });
    return Charges;
};