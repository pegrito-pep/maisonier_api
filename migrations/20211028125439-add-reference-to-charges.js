'use strict';
// sequelize-cli migration:generate --name migration-skeleton
module.exports = {
    up: async(query, DataTypes) => {
        const tableName = 'Charges',
            tableDefinition = await query.describeTable(tableName),
            promises = [];

        return await query.sequelize.transaction(transaction => {
            if (!tableDefinition.reference) {
                promises.push(query.addColumn(tableName, 'reference', {
                    type: DataTypes.STRING,
                    allowNull: false
                }, { transaction }))
            }
            return Promise.all(promises)
        })
    },

    down: async(query, DataTypes) => {

    }
};