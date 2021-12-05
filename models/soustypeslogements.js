'use strict';
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class SousTypesLogements extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.SousTypesLogements.belongsTo(models.TypesLogements, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idType'
                },
                as: 'typeLogement'
            })
        }
    }

    SousTypesLogements.init({
        idSousType: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        libelleSousType: { type: DataTypes.STRING, allowNull: false },
        descSousType: { type: DataTypes.STRING }
    }, {
        timestamps: false,
        sequelize,
        modelName: 'SousTypesLogements'
    })

    return SousTypesLogements
}