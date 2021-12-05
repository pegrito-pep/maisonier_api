'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Profils extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.Profils.belongsTo(models.Utilisateurs, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idUtilisateur'
                }
            })
        }
    };
    Profils.init({
        idUtilisateur: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true
        },
        tel2: DataTypes.STRING,
        tel3: DataTypes.STRING,
        tel4: DataTypes.STRING,
        email2: DataTypes.STRING,
        lieuNaiss: DataTypes.STRING,
        cni: DataTypes.STRING,
        titre: DataTypes.STRING,
        profession: DataTypes.STRING,
    }, {
        sequelize,
        timestamps: false,
        modelName: 'Profils',
    });

    return Profils;
};