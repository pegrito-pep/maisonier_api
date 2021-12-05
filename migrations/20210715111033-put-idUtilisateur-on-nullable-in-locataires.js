'use strict';
const { in_array } = require('php-in-js');

module.exports = {
    up: async(query, DataTypes) => {
        const tableName = 'Locataires',
            constraints = (await query.getForeignKeyReferencesForTable(tableName)).map(c => c.constraintName),
            indexes = (await query.showIndex(tableName)).map(i => i.name),
            promises = [];

        return query.sequelize.transaction(transaction => {
            if (in_array('locataires_ibfk_1', constraints)) {
                promises.push(query.removeConstraint(tableName, 'locataires_ibfk_1'), { transaction })
            }
            if (in_array('idUtilisateur', indexes)) {
                promises.push(query.removeIndex(tableName, 'idUtilisateur', { transaction }))
            }
            if (in_array('locataires_ibfk_1', indexes)) {
                //   promises.push(query.removeIndex(tableName, 'locataires_ibfk_1', { transaction }))
            }
            promises.push(query.changeColumn(tableName, 'idUtilisateur', {
                    type: DataTypes.UUID,
                    allowNull: true
                }, { transaction }))
                /* promises.push(query.addConstraint(tableName, {
                type: 'FOREIGN KEY',
                name: 'locataires_ibfk_1',
                fields: ['idUtilisateur'],
                references: {
                    table: 'Utilisateurs',
                    fields: ['idUtilisateur']
                },
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT'
            }))
*/
            return Promise.all(promises);
        });
    },

    down: async(query, DataTypes) => {}
};