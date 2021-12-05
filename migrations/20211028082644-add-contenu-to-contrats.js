'use strict';
// sequelize-cli migration:generate --name migration-skeleton
module.exports = {
    up: async(query, DataTypes) => {
        const tableName = 'Contrats',
            tableDefinition = await query.describeTable(tableName),
            promises = [];

        return await query.sequelize.transaction(transaction => {
            if (!tableDefinition.contenu) {
                promises.push(query.addColumn(tableName, 'contenu', {
                    type: DataTypes.TEXT('long')
                }, { transaction }))
            }
            return Promise.all(promises)
        })
    },

    down: async(query, DataTypes) => {

    }
};