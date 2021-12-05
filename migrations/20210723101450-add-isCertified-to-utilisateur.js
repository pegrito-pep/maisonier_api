'use strict';

module.exports = {
    /**
     * @description Up.
     * @param {QueryInterface} queryInterface
     * @return Promise<void>
     */
    up: async(query, DataTypes) => {
        const tableName = 'Utilisateurs',
            tableDefinition = await query.describeTable(tableName),
            promises = [];

        return query.sequelize.transaction(transaction => {
            if (!tableDefinition.isCertified) {
                promises.push(query.addColumn(tableName, 'isCertified', {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false
                }, { transaction }));
            }

            return Promise.all(promises);
        });
    },

    /**
     * @description Down.
     * @param {QueryInterface} query
     * @return Promise<void>
     */
    down: (query) => {

    },
};