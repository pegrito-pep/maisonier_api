'use strict';

module.exports = {
    up: async(query, DataTypes) => {
        const tableName = 'Indexes',
            tableDefinition = await query.describeTable(tableName),
            promises = [];

        let find = (await query.getForeignKeyReferencesForTable(tableName)).filter(c => (c.referencedTableName == 'Occupations' && c.referencedColumnName == 'idOccupation'))

        return await query.sequelize.transaction(transaction => {
            if (!tableDefinition.idOccupation) {
                promises.push(query.addColumn(tableName, 'idOccupation', {
                    type: DataTypes.INTEGER,
                    allowNull: true
                }))

                if (!find.length) {
                    promises.push(query.addConstraint(tableName, {
                        type: 'FOREIGN KEY',
                        fields: ['idOccupation'],
                        references: {
                            table: 'Occupations',
                            fields: ['idOccupation']
                        },
                        onDelete: 'SET NULL',
                        onUpdate: 'RESTRICT'
                    }))
                }
            }

            return Promise.all(promises)
        })
    },

    down: async(query, DataTypes) => {

    }
};