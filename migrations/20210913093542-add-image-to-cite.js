'use strict';

module.exports = {
    up: async(query, DataTypes) => {
        const tableName = 'Cites',
            tableDefinition = await query.describeTable(tableName),
            promises = [];

        return await query.sequelize.transaction(transaction => {
            if (!tableDefinition.image) {
                promises.push(query.addColumn(tableName, 'image', {
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