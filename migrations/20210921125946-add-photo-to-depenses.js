'use strict';

module.exports = {
    up: async(query, DataTypes) => {
        const tableName = 'Depenses',
            tableDefinition = await query.describeTable(tableName),
            promises = [];

        return await query.sequelize.transaction(transaction => {
            if (!tableDefinition.photo) {
                promises.push(query.addColumn(tableName, 'photo', {
                    type: DataTypes.STRING,
                    allowNull: true
                }))
            }

            return Promise.all(promises)
        })
    },

    down: async(query, DataTypes) => {

    }
};