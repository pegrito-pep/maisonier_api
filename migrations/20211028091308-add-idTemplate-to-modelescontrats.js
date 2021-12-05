'use strict';

module.exports = {
    up: async(query, DataTypes) => {
        const tableName = 'ModelesContrats',
            tableDefinition = await query.describeTable(tableName),
            promises = [];

        let find = (await query.getForeignKeyReferencesForTable(tableName)).filter(c => (c.referencedTableName.toLowerCase() == 'templatescontrats' && c.referencedColumnName == 'idTemplate'))

        return await query.sequelize.transaction(transaction => {
            if (!tableDefinition.idTemplate) {
                promises.push(query.addColumn(tableName, 'idTemplate', {
                    type: DataTypes.INTEGER,
                    allowNull: true
                }))

                if (!find.length) {
                    promises.push(query.addConstraint(tableName, {
                        type: 'FOREIGN KEY',
                        fields: ['idTemplate'],
                        references: {
                            table: 'TemplatesContrats',
                            fields: ['idTemplate']
                        },
                        onDelete: 'CASCADE',
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