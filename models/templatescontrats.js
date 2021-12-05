'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class TemplatesContrats extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.TemplatesContrats.hasMany(models.ModelesContrats, {
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
                foreignKey: {
                    allowNull: true,
                    name: 'idTemplate'
                },
                as: 'modelesContrats'
            })
        }
    }

    TemplatesContrats.init({
        idTemplate: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        titreTemplate: { type: DataTypes.STRING, allowNull: false },
        contenu: DataTypes.TEXT('long'),
    }, {
        sequelize,
        modelName: 'TemplatesContrats',
    })

    return TemplatesContrats
};