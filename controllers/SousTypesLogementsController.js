const asyncLib = require('async')

const db = require('../models')
const response = require('../utils/response')


/**
 * Ajout d'un nouveau sous-type de logement
 */
exports.add = (req, res) => {
    const libelleSousType = req.body.libelle || '',
        descSousType = req.body.description || '',
        idType = req.body.idType || ''

    if (libelleSousType == '' || idType == '') {
        return response(res).fail('Données incomplètes', 400)
    }

    asyncLib.waterfall([
        (done) => {
            db.SousTypesLogements.count({ where: { libelleSousType } }).then(exist => {
                if (exist) {
                    return response(res).fail('Un sous type de logement ayant ce nom existe déjà', 409)
                }
                done(null)
            })
        },
        (done) => {
            db.SousTypesLogements.create({
                libelleSousType,
                descSousType,
                idType
            }).then(sousType => {
                done(sousType)
            }).catch(e => {
                return response(res).fail('Une erreur s\'est produite lors de l\'opération')
            })
        }
    ], (sousType) => {
        return response(res).success('Sous type de logement ajouté avec succès', sousType)
    })
}

/**
 * Liste de tous les sous types de logements
 */
exports.list = (req, res) => {
    const idType = req.params.idType || null
    let options = {}

    if (idType) {
        options.where = { idType }
    } else {
        options.include = [{
            model: db.TypesLogements, as : 'typeLogement',
            attributes: ['idType', 'libelleType']
        }]
    }
    db.SousTypesLogements.findAll(options).then(sousTypes => {
            return response(res).success('Liste des sous types de logements', sousTypes)
        })
        .catch(err => {
            return response(res).fail('Une erreur s\'est produite ', err)
        })
}

/**
 * Edition des informations d'un sous type 
 */
exports.edit = (req, res) => {
    const libelleSousType = req.body.libelle,
        descSousType = req.body.description,
        idType = req.body.idType,
        idSousType = req.params.idSousType

    asyncLib.waterfall([
        (done) => {
            db.SousTypesLogements.findByPk(idSousType).then(sousType => {
                if (!sousType) {
                    return response(res).fail('Sous type innexistant', 404)
                }
                done(null, sousType)
            })
        },
        (sousType, done) => {
            db.SousTypesLogements.update({
                libelleSousType: libelleSousType || sousType.libelleSousType,
                descSousType: descSousType || sousType.descSousType,
                idType: idType || sousType.idType
            }, { where: { idSousType } }).then(sousType => {
                done(sousType)
            }).catch(e => {
                return response(res).fail('Une erreur s\'est produite lors de l\'opération')
            })
        }
    ], (sousType) => {
        return response(res).success('Sous type modifié avec succès')
    })
}

/**
 * Suppression d'un sous type de logement
 */
exports.remove = (req, res) => {
    const force = req.query.force === 'true',
        idSousType = req.params.idSousType,
        idType = req.params.idType

    if (!idSousType && !idType) {
        return response(res).fail('Auncune action a effectuer', 100)
    }

    if (force) {
        db.SousTypesLogements.destroy({ where: idSousType ? { idSousType } : { idType } })

        return response(res).success('Suppression effectuée avec succès')
    }

    asyncLib.waterfall([
        (done) => {
            db.SousTypesLogements.findAll({
                where: idSousType ? { idSousType } : { idType },
                attributes: ['idSousType', 'libelleSousType']
            }).then(sousTypes => {
                done(sousTypes)
            })
        },

    ], async(datas) => {
        let supprimables = [],
            nonSupprimables = []
        const tables = [db.Logements],
            sousTypes = datas.map(element => element.dataValues)

        for (let j = 0, count = sousTypes.length; j < count; j++) {
            let exist = false,
                sousType = sousTypes[j]

            for (let i = 0, size = tables.length; i < size; i++) {
                const table = tables[i]
                exist = await table.count({ where: { idSousType: sousType.idSousType } })
                if (exist) {
                    break
                }
            }
            if (exist) {
                nonSupprimables.push(sousType.libelleSousType)
            } else {
                supprimables.push(sousType.idSousType)
            }
        }

        supprimables.forEach(idSousType => {
            db.SousTypesLogements.destroy({ where: { idSousType } })
        })
        if (nonSupprimables.length) {
            return response(res).fail('Impossible de supprimer les sous type < ' + (nonSupprimables).join(', ') + ' >', 405)
        }
        return response(res).success('Suppression effectuée avec succès')
    })
}