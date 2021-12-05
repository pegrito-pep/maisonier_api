'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class TypesLogements extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.TypesLogements.hasMany(models.SousTypesLogements, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idType'
                },
                as: 'sousTypesLogement'
            })
        }
    };
    TypesLogements.init({
        idType: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        libelleType: { type: DataTypes.STRING, allowNull: false },
        descType: { type: DataTypes.STRING }
    }, {
        timestamps: false,
        sequelize,
        modelName: 'TypesLogements',
    });
    return TypesLogements;
};