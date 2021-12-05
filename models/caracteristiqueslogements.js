'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class CaracteristiquesLogements extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.CaracteristiquesLogements.belongsTo(models.Logements, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idLogement'
                }
            })
        }
    };
    CaracteristiquesLogements.init({
        idCaracteristique: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        idLogement: DataTypes.INTEGER,
        libelleCaracteristique: { type: DataTypes.STRING, allowNull: false },
        valeur: { type: DataTypes.STRING, allowNull: false }
    }, {
        sequelize,
        timestamps: false,
        modelName: 'CaracteristiquesLogements',
    });

    return CaracteristiquesLogements;
};