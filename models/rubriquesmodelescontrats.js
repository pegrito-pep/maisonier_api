'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class RubriquesModelesContrats extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.ModelesContrats.belongsToMany(models.Rubriques, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                through: models.RubriquesModelesContrats,
                foreignKey: 'idModele',
                otherKey: 'idRubrique'
            })

            models.Rubriques.belongsToMany(models.ModelesContrats, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                through: models.RubriquesModelesContrats,
                foreignKey: 'idRubrique',
                otherKey: 'idModele'
            })

            models.RubriquesModelesContrats.belongsTo(models.ModelesContrats, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idModele'
                },
                as: 'modele',
            })

            models.RubriquesModelesContrats.belongsTo(models.Rubriques, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idRubrique'
                },
                as: 'rubrique',
            })
        }
    };
    RubriquesModelesContrats.init({
        idModele: DataTypes.INTEGER,
        idRubrique: DataTypes.INTEGER
    }, {
        timestamps: false,
        sequelize,
        modelName: 'RubriquesModelesContrats',
    });

    return RubriquesModelesContrats;
};