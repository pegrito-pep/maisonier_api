const asyncLib = require('async')

const db = require('../models')
const response = require('../utils/response')

/**
 * Ajout d'un nouveau type de logement
 */
exports.add = (req, res) => {
    const libelleType = req.body.libelle || '',
        descType = req.body.description || ''

    if (libelleType == '') {
        return response(res).fail('Données incomplètes', 400)
    }

    asyncLib.waterfall([
        (done) => {
            db.TypesLogements.count({ where: { libelleType } }).then(exist => {
                if (exist) {
                    return response(res).fail('Un type de logement ayant ce nom existe déjà', 409)
                }
                done(null)
            })
        },
        (done) => {
            db.TypesLogements.create({
                libelleType,
                descType
            }).then(type => {
                done(type)
            }).catch(e => {
                return response(res).fail('Une erreur s\'est produite lors de l\'opération')
            })
        }
    ], (type) => {
        return response(res).success('Type de logement ajouté avec succès', type)
    })
}

/**
 * Liste de tous les types de logements
 */
exports.list = (req, res) => {
    const all = req.query.all == 'true'
    let obj = {}

    if (all) {
        obj = {
            include: [{ 
                model: db.SousTypesLogements, as: 'sousTypesLogement',
                attributes: ['idSousType', 'libelleSousType']
            }]
        }
    }
    db.TypesLogements.findAll(obj).then(types => {
            return response(res).success('Liste des types de logements', types)
        })
        .catch(err => {
            return response(res).fail('Une erreur s\'est produite', err)
        })
}

/**
 * Edition des informations d'un sous type 
 */
exports.edit = (req, res) => {
    const libelleType = req.body.libelle,
        descType = req.body.description,
        idType = req.params.idType

    asyncLib.waterfall([
        (done) => {
            db.TypesLogements.findByPk(idType).then(type => {
                if (!type) {
                    return response(res).fail('Type de logement innexistant', 404)
                }
                done(null, type)
            })
        },
        (type, done) => {
            db.TypesLogements.update({
                libelleType: libelleType || type.libelleType,
                descType: descType || type.descType
            }, { where: { idType } }).then(type => {
                done(type)
            }).catch(e => {
                return response(res).fail('Une erreur s\'est produite lors de l\'opération')
            })
        }
    ], (type) => {
        return response(res).success('Type de logement modifié avec succès')
    })
}

/**
 * Suppression d'un type de logement
 */
exports.remove = (req, res) => {
    const force = req.query.force === 'true',
        idType = req.params.idType

    if (force) {
        db.TypesLogements.destroy({ where: idType ? { idType } : {} })

        return response(res).success('Suppression effectuée avec succès')
    }

    asyncLib.waterfall([
        (done) => {
            db.TypesLogements.findAll({
                where: { idType },
                attributes: ['idType', 'libelleType']
            }).then(types => {
                done(types)
            })
        },

    ], async(datas) => {
        let supprimables = [],
            nonSupprimables = []
        const tables = [db.SousTypesLogements],
            types = datas.map(element => element.dataValues)

        for (let j = 0, count = types.length; j < count; j++) {
            let exist = false,
                type = types[j]

            for (let i = 0, size = tables.length; i < size; i++) {
                const table = tables[i]
                exist = await table.count({ where: { idType: type.idType } })
                if (exist) {
                    break
                }
            }
            if (exist) {
                nonSupprimables.push(type.libelleType)
            } else {
                supprimables.push(type.idType)
            }
        }

        supprimables.forEach(idType => {
            db.TypesLogements.destroy({ where: { idType } })
        })
        if (nonSupprimables.length) {
            return response(res).fail('Impossible de supprimer les sous type < ' + (nonSupprimables).join(', ') + ' >', 405)
        }
        return response(res).success('Suppression effectuée avec succès')
    })
}