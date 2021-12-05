'use strict';

const { Model, Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Annonces extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.Annonces.belongsTo(models.Logements, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idLogement',
                },
                as: 'logement'
            })

            models.Annonces.hasMany(models.Propositions, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idAnnonce',
                },
                as: 'propositions'
            })
        }
    }

    Annonces.init({
        idAnnonce: { type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.UUIDV4 },
        titreAnnonce: { type: DataTypes.STRING, allowNull: false },
        descAnnonce: { type: DataTypes.TEXT, allowNull: true },
        etatAnnonce: { type: DataTypes.BOOLEAN, defaultValue: true },
        publish: { type: DataTypes.BOOLEAN, defaultValue: false },
        tags: DataTypes.STRING,
        dateFin: DataTypes.DATEONLY,
        dateDeb: DataTypes.DATEONLY,
    }, {
        sequelize,
        modelName: 'Annonces',
    })

    return Annonces
};