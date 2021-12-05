'use strict';

module.exports = {
    /**
     * @description Up.
     * @param {QueryInterface} queryInterface
     * @return Promise<void>
     */
    up: async(query, DataTypes) => {
        const tableName = 'Locataires',
            tableDefinition = await query.describeTable(tableName),
            promises = [];

        return query.sequelize.transaction(transaction => {
            if (!tableDefinition.nomLocataire) {
                promises.push(query.addColumn(tableName, 'nomLocataire', {
                    type: DataTypes.STRING
                }, { transaction }));
            }
            if (!tableDefinition.prenomLocataire) {
                promises.push(query.addColumn(tableName, 'prenomLocataire', {
                    type: DataTypes.STRING
                }, { transaction }));
            }
            if (!tableDefinition.tel) {
                promises.push(query.addColumn(tableName, 'tel', {
                    type: DataTypes.STRING,
                    allowNull: false
                }, { transaction }));
            }
            if (!tableDefinition.tel2) {
                promises.push(query.addColumn(tableName, 'tel2', {
                    type: DataTypes.STRING
                }, { transaction }));
            }
            if (!tableDefinition.tel3) {
                promises.push(query.addColumn(tableName, 'tel3', {
                    type: DataTypes.STRING
                }, { transaction }));
            }
            if (!tableDefinition.tel4) {
                promises.push(query.addColumn(tableName, 'tel4', {
                    type: DataTypes.STRING
                }, { transaction }));
            }
            if (!tableDefinition.email) {
                promises.push(query.addColumn(tableName, 'email', {
                    type: DataTypes.STRING
                }, { transaction }));
            }
            if (!tableDefinition.email2) {
                promises.push(query.addColumn(tableName, 'email2', {
                    type: DataTypes.STRING
                }, { transaction }));
            }
            if (!tableDefinition.genre) {
                promises.push(query.addColumn(tableName, 'genre', {
                    type: DataTypes.STRING
                }, { transaction }));
            }
            if (!tableDefinition.titre) {
                promises.push(query.addColumn(tableName, 'titre', {
                    type: DataTypes.STRING
                }, { transaction }));
            }
            if (!tableDefinition.profession) {
                promises.push(query.addColumn(tableName, 'profession', {
                    type: DataTypes.STRING
                }, { transaction }));
            }
            if (!tableDefinition.dateNaiss) {
                promises.push(query.addColumn(tableName, 'dateNaiss', {
                    type: DataTypes.STRING
                }, { transaction }));
            }
            if (!tableDefinition.lieuNaiss) {
                promises.push(query.addColumn(tableName, 'lieuNaiss', {
                    type: DataTypes.STRING
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