'use strict';
const db = require('../models')
const typesCharges = require('../data/typescharges.json')

module.exports = {
    up: async(queryInterface, Sequelize) => {
        const promises = []
        for (let i = 0, size = typesCharges.length; i < size; i++) {
            promises.push(db.TypesCharges.create({ libelle: typesCharges[i] }))
        }

        return Promise.all(promises)
    },

    down: async(queryInterface, Sequelize) => {
        const promises = []
        for (let i = 0, size = typesCharges.length; i < size; i++) {
            promises.push(db.TypesCharges.delete({ libelle: typesCharges[i] }))
        }

        return Promise.all(promises)
    }
};