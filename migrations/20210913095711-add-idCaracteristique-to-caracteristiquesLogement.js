'use strict';

module.exports = {
    up: async(query, DataTypes) => {
        const tableName = 'CaracteristiquesLogements',
            tableDefinition = await query.describeTable(tableName),
            promises = [];

        return await query.sequelize.transaction(transaction => {
            if (!tableDefinition.idCaracteristique) {
                promises.push(query.addColumn(tableName, 'idCaracteristique', {
                  type: DataTypes.INTEGER, 
                  primaryKey: true, 
                  allowNull: false, 
                  autoIncrement: true
                }))
            }

            return Promise.all(promises)
        })
    },

    down: async(query, DataTypes) => {

    }
};