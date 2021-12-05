'use strict';

module.exports = {
    up: async(query, DataTypes) => {
        const tableDefinition = await query.describeTable('Profils'),
            promises = [];

        return query.sequelize.transaction(transaction => {
            if (tableDefinition.dateNaiss) {
                promises.push(query.removeColumn('Profils', 'dateNaiss', { transaction }))
            }
            promises.push(query.changeColumn('Utilisateurs', 'dateNaiss', {
                type: DataTypes.DATEONLY
            }, { transaction }))

            return Promise.all(promises);
        });
    },

    down: async(query, DataTypes) => {}
};