'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Contrats extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.Contrats.belongsTo(models.Occupations, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idOccupation'
                },
                as: 'occupation'
            })
        }
    }

    Contrats.init({
        idContrat: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        idOccupation: DataTypes.INTEGER,
        contenu: DataTypes.TEXT('long'),
    }, {
        sequelize,
        modelName: 'Contrats',
    })

    return Contrats
};