'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class RubriquesContrats extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.Contrats.belongsToMany(models.Rubriques, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                through: models.RubriquesContrats,
                foreignKey: 'idContrat',
                otherKey: 'idRubrique'
            })

            models.Rubriques.belongsToMany(models.Contrats, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                through: models.RubriquesContrats,
                foreignKey: 'idRubrique',
                otherKey: 'idContrat'
            })

            models.RubriquesContrats.belongsTo(models.Contrats, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idContrat'
                },
                as: 'contrat',
            })

            models.RubriquesContrats.belongsTo(models.Rubriques, {
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
    RubriquesContrats.init({
        idContrat: DataTypes.INTEGER,
        idRubrique: DataTypes.INTEGER,
        valeur: { type: DataTypes.STRING, allowNull: true }
    }, {
        timestamps: false,
        sequelize,
        modelName: 'RubriquesContrats',
    });

    return RubriquesContrats;
};