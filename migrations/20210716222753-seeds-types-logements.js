'use strict';

const db = require('../models')
const typesLogements = require('../data/typeslogements.json')

module.exports = {
    up: async function(queryInterface, Sequelize) {
        const promises = []

        for (let i = 0, size = typesLogements.length; i < size; i++) {
            const tl = typesLogements[i]

            if (!await db.TypesLogements.count({ where: { libelleType: tl.libelleType } })) {
                const sousTypesLogement = []
                for (let j = 0, count = tl.sousTypes.length; j < count; j++) {
                    const st = tl.sousTypes[j]
                    if (!await db.SousTypesLogements.count({ where: { libelleSousType: st.libelleSousType } })) {
                        sousTypesLogement.push({
                            libelleSousType: st.libelleSousType,
                            descSousType: st.descSousType
                        })
                    }
                }
                promises.push(db.TypesLogements.create({
                    libelleType: tl.libelleType,
                    descType: tl.descType,
                    sousTypesLogement
                }, { include: [{model: db.SousTypesLogements, as: 'sousTypesLogement'}] }))
            }
        }

        return Promise.all(promises)
    },

    down: async(queryInterface, Sequelize) => {
        const promises = []

        for (let i = 0, size = typesLogements.length; i < size; i++) {
            promises.push(db.TypesLogements.delete({ where: { libelleType: typesLogements[i].libelleType } }))
        }

        return Promise.all(promises)
    }
};