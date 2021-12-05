'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Indexes extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.Indexes.belongsTo(models.Logements, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idLogement'
                },
                as: 'logement'
            })

            models.Indexes.belongsTo(models.Occupations, {
                onDelete: 'SET NULL',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: true,
                    name: 'idOccupation'
                },
                as: 'occupation'
            })
        }

        /**
         * retourne la consommation due 
         * 
         * @returns {Number}
         */
        consommation() {
            return this.nouveau - this.ancien
        }

    }

    Indexes.init({
        idIndexe: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        typeIndexe: { type: DataTypes.STRING, allowNull: false },
        ancien: { type: DataTypes.INTEGER, allowNull: false },
        nouveau: { type: DataTypes.INTEGER, allowNull: false },
        periode: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
        avance: DataTypes.INTEGER,
        reste: DataTypes.INTEGER,
        datePaiement: DataTypes.DATE,
    }, {
        timestamps: false,
        sequelize,
        modelName: 'Indexes',
    })

    return Indexes
};