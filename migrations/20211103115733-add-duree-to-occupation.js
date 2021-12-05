'use strict';
// sequelize-cli migration:generate --name migration-skeleton
module.exports = {
    up: async(query, DataTypes) => {
        const tableName = 'Occupations',
            tableDefinition = await query.describeTable(tableName),
            promises = [];

        return await query.sequelize.transaction(transaction => {
            if (!tableDefinition.dureeBail) {
                promises.push(query.addColumn(tableName, 'dureeBail', {
                    type: DataTypes.INTEGER
                }, { transaction }))
            }
            return Promise.all(promises)
        })
    },

    down: async(query, DataTypes) => {

    }
};