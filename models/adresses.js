'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Adresses extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.Adresses.belongsTo(models.Logements, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: true,
                    name: 'idLogement'
                }
            })
            models.Adresses.belongsTo(models.Batiments, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: true,
                    name: 'idBatiment'
                }
            })
        }
    };
    Adresses.init({
        idAdresse: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        pays: { type: DataTypes.STRING, allowNull: false },
        ville: { type: DataTypes.STRING, allowNull: false },
        quartier: { type: DataTypes.STRING, allowNull: false },
        lon: { type: DataTypes.STRING },
        lat: { type: DataTypes.STRING }
    }, {
        sequelize,
        timestamps: false,
        modelName: 'Adresses',
    });
    return Adresses;
};