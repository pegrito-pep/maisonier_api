'use strict';
const { Model } = require('sequelize');
const { baseUrl } = require('../config/env')
const { empty } = require('php-in-js')
module.exports = (sequelize, DataTypes) => {
    class Photos extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            models.Photos.belongsTo(models.Logements, {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
                foreignKey: {
                    allowNull: false,
                    name: 'idLogement'
                }
            })
        }
    };
    Photos.init({
        idPhoto: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
        image: { 
            type: DataTypes.TEXT, allowNull: false, 
            get() {
                const rawValue = this.getDataValue('image');
                if (empty(rawValue)) {
                    return rawValue;
                }
                return `${baseUrl.replace('/api', '')}/api/static/${rawValue.split('static/')[1]}`
            }
        },
    }, {
        sequelize,
        modelName: 'Photos',
    });
    return Photos;
};