'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Preferences extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.Preferences.belongsTo(models.Utilisateurs, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idUtilisateur'
                },
                as: 'utilisateur'
            })
        }
    };
    Preferences.init({
        idUtilisateur: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true
        },
        langue: { type: DataTypes.STRING, allowNull: false, defaultValue: 'en' },
        devise: { type: DataTypes.STRING, allowNull: false, defaultValue: 'F' },
        puEnergie: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
        puEau: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    }, {
        sequelize,
        timestamps: false,
        modelName: 'Preferences',
    });

    return Preferences;
};