'use strict';
module.exports = {
    up: async(query, DataTypes) => {
        const tableName = 'Profils',
            tableDefinition = await query.describeTable(tableName),
            promises = [];

        return await query.sequelize.transaction(transaction => {
            if (tableDefinition.telOrange) {
                promises.push(query.removeColumn(tableName, 'telOrange', { transaction }))
            }
            if (tableDefinition.telMtn && !tableDefinition.tel2) {
                promises.push(query.renameColumn(tableName, 'telMtn', 'tel2', { type: DataTypes.STRING }, { transaction }))
            }
            if (tableDefinition.telNexttel && !tableDefinition.tel3) {
                promises.push(query.renameColumn(tableName, 'telNexttel', 'tel3', { type: DataTypes.STRING }, { transaction }))
            }
            if (tableDefinition.telCamtel && !tableDefinition.tel4) {
                promises.push(query.renameColumn(tableName, 'telCamtel', 'tel4', { type: DataTypes.STRING }, { transaction }))
            }
            if (tableDefinition.autreEmail && !tableDefinition.email2) {
                promises.push(query.renameColumn(tableName, 'autreEmail', 'email2', { type: DataTypes.STRING }, { transaction }))
            }

            return Promise.all(promises)
        })
    },

    down: async(query, DataTypes) => {}
};