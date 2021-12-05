'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Rubriques extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.Rubriques.belongsTo(models.Articles, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idArticle'
                },
                as: 'article'
            })

            models.Rubriques.belongsToMany(models.Contrats, {
                foreignKey: 'idRubrique',
                otherKey: 'idContrat',
                through: models.RubriquesContrats
            })

            models.Rubriques.belongsToMany(models.ModelesContrats, {
                foreignKey: 'idRubrique',
                otherKey: 'idModele',
                through: models.RubriquesModelesContrats
            })
        }
    }

    Rubriques.init({
        idRubrique: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        idArticle: DataTypes.INTEGER,
        descRubrique: DataTypes.TEXT,
        valeur: { type: DataTypes.BOOLEAN, defaultValue: false },
        statutRubrique: { type: DataTypes.BOOLEAN, defaultValue: true },
    }, {
        timestamps: false,
        sequelize,
        modelName: 'Rubriques',
    })

    return Rubriques
};