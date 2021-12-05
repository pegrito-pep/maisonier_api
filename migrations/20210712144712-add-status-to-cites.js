'use strict';
// sequelize-cli migration:generate --name migration-skeleton
module.exports = {
    up: async(query, DataTypes) => {
        const tableName = 'Cites',
            tableDefinition = await query.describeTable(tableName),
            promises = [];

        return await query.sequelize.transaction(transaction => {
            if (!tableDefinition.statutCite) {
                promises.push(query.addColumn('Cites', 'statutCite', {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true
                }, { transaction }))
            }
            return Promise.all(promises)
        })
    },

    down: async(query, DataTypes) => {

    }
};