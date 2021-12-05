'use strict';
module.exports = {
    up: async(query, DataTypes) => {
        const tableName = 'Charges',
            tableDefinition = await query.describeTable(tableName),
            promises = [];

        return await query.sequelize.transaction(transaction => {
            if (tableDefinition.dateCharge && !tableDefinition.periode) {
                promises.push(query.renameColumn(tableName, 'dateCharge', 'periode', { type: DataTypes.DATEONLY }, { transaction }))
            }

            return Promise.all(promises)
        })
    },

    down: async(query, DataTypes) => {}
};