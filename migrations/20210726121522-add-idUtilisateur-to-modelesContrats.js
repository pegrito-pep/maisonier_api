'use strict';

module.exports = {
    up: async(query, DataTypes) => {
        const tableName = 'ModelesContrats',
            tableDefinition = await query.describeTable(tableName),
            promises = [];

        let find = (await query.getForeignKeyReferencesForTable(tableName)).filter(c => (c.referencedTableName == 'Utilisateurs' && c.referencedColumnName == 'idUtilisateur'))

        return await query.sequelize.transaction(transaction => {
            if (!tableDefinition.idUtilisateur) {
                promises.push(query.addColumn(tableName, 'idUtilisateur', {
                    type: DataTypes.UUID,
                    allowNull: false
                }))

                if (!find.length) {
                    promises.push(query.addConstraint(tableName, {
                        type: 'FOREIGN KEY',
                        fields: ['idUtilisateur'],
                        references: {
                            table: 'Utilisateurs',
                            fields: ['idUtilisateur']
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