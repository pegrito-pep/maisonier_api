'use strict';

module.exports = {
    up: async(query, DataTypes) => {
        const tableName = 'Annonces',
            promises = [];

        return query.sequelize.transaction(transaction => {
            promises.push(query.changeColumn(tableName, 'descAnnonce', {
                type: DataTypes.TEXT,
                allowNull: false
            }, { transaction }))
            return Promise.all(promises);
        });
    },

    down: async(query, DataTypes) => {}
};