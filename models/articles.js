'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Articles extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.Articles.hasMany(models.Rubriques, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idArticle'
                },
                as: 'rubriques'
            })

            models.Articles.belongsTo(models.Utilisateurs, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idUtilisateur'
                }
            })
        }
    }

    Articles.init({
        idArticle: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        idUtilisateur: DataTypes.UUID,
        titreArticle: { type: DataTypes.STRING, allowNull: false },
        numArticle: { type: DataTypes.INTEGER, allowNull: false },
        statutArticle: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, {
        timestamps: false,
        sequelize,
        modelName: 'Articles',
    })

    return Articles
};