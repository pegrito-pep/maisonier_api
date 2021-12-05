'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ModelesContrats extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.ModelesContrats.hasMany(models.Logements, {
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
                foreignKey: {
                    allowNull: true,
                    name: 'idModele'
                },
                as: 'logements'
            })

            models.ModelesContrats.belongsTo(models.Utilisateurs, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idUtilisateur'
                },
                as: 'utilisateur'
            })

            models.ModelesContrats.belongsTo(models.TemplatesContrats, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: true,
                    name: 'idTemplate'
                },
                as: 'templateContrat'
            })
        }
    }

    ModelesContrats.init({
        idModele: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        idUtilisateur: DataTypes.UUID,
        libelleModele: { type: DataTypes.STRING, allowNull: false },
        contenu: DataTypes.TEXT('long'),
    }, {
        sequelize,
        modelName: 'ModelesContrats',
    })

    return ModelesContrats
};