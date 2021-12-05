'use strict';
const { day } = require('../utils')

const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Loyers extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.Loyers.belongsTo(models.Occupations, {
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                foreignKey: {
                    allowNull: false,
                    name: 'idOccupation'
                },
                as: 'occupation'
            })
        }
    }

    Loyers.init({
        idLoyer: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        idOccupation: DataTypes.INTEGER,
        montant: { type: DataTypes.INTEGER, allowNull: false },
        montantPayer: { type: DataTypes.INTEGER, defaultValue: 0 },
        periode: {
            type: DataTypes.DATEONLY,
            allowNull: false,
           /*  get() {
                return day().simple(this.getDataValue('periode')).format("MMMM YYYY")
            } */
        },
        datePaiement: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Loyers',
    })

    return Loyers
};