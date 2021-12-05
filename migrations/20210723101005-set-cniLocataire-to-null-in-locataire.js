'use strict';

module.exports = {
    up: async(query, DataTypes) => {
        const tableName = 'Locataires',
            promises = [];

        return query.sequelize.transaction(transaction => {
            promises.push(query.changeColumn(tableName, 'cniLocataire', {
                type: DataTypes.STRING,
                allowNull: true
            }, { transaction }))
            return Promise.all(promises);
        });
    },

    down: async(query, DataTypes) => {}
};