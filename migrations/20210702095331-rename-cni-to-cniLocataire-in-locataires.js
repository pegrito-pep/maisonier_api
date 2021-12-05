'use strict';
module.exports = {
    up: async(query, DataTypes) => {
        const tableName = 'Locataires',
            tableDefinition = await query.describeTable(tableName),
            promises = [];

        return await query.sequelize.transaction(t => {
            if (tableName.cni && !tableDefinition.cniLocataire) {
                promises.push(query.renameColumn('Locataires', 'cni', 'cniLocataire', {
                    type: DataTypes.STRING,
                    allowNull: false
                }, { transaction }))
            }

            return Promise.all(promises)
        })
    },

    down: async(query, DataTypes) => {}
};