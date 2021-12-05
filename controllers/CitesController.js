const md5 = require('md5')
const pij = require('php-in-js')
const { empty } = pij

const db = require('../models')
const { uploadImage, removeImage } = require('../utils/utils')

/**
 * Ajout d'une nouvelle cite
 */
exports.add = async(req, res) => {
    const nomCite = req.body.nom,
        refCite = req.body.ref,
        photo = req.body.photo,
        idEntreprise = req.body.idEntreprise || req.user.idEntreprise || null

    if (empty(nomCite) || empty(refCite)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }

    if (await db.Cites.count({
            where: {
                [db.Op.and]: [
                    { nomCite },
                    idEntreprise ? { idEntreprise } : { idUtilisateur: req.user.idUtilisateur }
                ]
            }
        })) {
        return res.fail(res.translate('vous_avez_deja_une_cite_ayant_ce_nom'), 409)
    }

    let data = {
        nomCite,
        refCite,
        image: ''
    }
    if (idEntreprise) {
        data.idEntreprise = idEntreprise
    } else {
        data.idUtilisateur = req.user.idUtilisateur
    }
    if (!empty(photo)) {
        data.image = uploadImage(photo, 'cites', md5(pij.uniqid()))
    }

    const cite = await db.Cites.create(data)

    return res.success(res.translate('cite_ajouter_avec_succes'), cite, 201)
}

/**
 * Liste de toutes les cites d'un utilisateur
 */
exports.list = async(req, res) => {
    const idEntreprise = req.params.idEntreprise || req.user.idEntreprise || null

    let where = idEntreprise ? { idEntreprise } : { idUtilisateur: req.user.idUtilisateur }
    where.statutCite = !(req.query.restorable === 'true')

    const cites = (await db.Cites.findAll({ where }))
    for (let i = 0; i < cites.length; i++) {
        const image = cites[i].image
        cites[i] = cites[i].dataValues

        cites[i].image = image
        cites[i].batiments = await db.Batiments.findAll({where: {idCite: cites[i].idCite, statutBatiment: true}})
        cites[i].depenses = await db.Depenses.findAll({where: { idCite: cites[i].idCite }})
    }
    return res.success(res.translate('liste_des_cites'), cites)
}

exports.all = async(req, res) => {
    const idEntreprise = req.params.idEntreprise || req.user.idEntreprise || null

    let where = idEntreprise ? { idEntreprise } : { idUtilisateur: req.user.idUtilisateur }
    where.statutCite = !(req.query.restorable === 'true')

    let cites = (await db.Cites.findAll({ where }))

    for (let i = 0, size = cites.length; i < size; i++) {
        const image = cites[i].image
        cites[i] = cites[i].dataValues
        cites[i].image = image

        let batiments = (await db.Batiments.findAll({
            where: { idCite: cites[i].idCite }
        })).map(elt => elt.dataValues)

        cites[i].depenses = await db.Depenses.findAll({where: { idCite: cites[i].idCite }})
        cites[i].batiments = batiments
        cites[i].nbrBatiment = batiments.length

        cites[i].nbrLogement = 0
        cites[i].nbrAnnonce = 0
        cites[i].budgetAttendu = 0

        for (let j = 0, count = batiments.length; j < count; j++) {
            let logements = (await db.Logements.findAll({
                where: { idBatiment: batiments[j].idBatiment },
                include: [{
                    model: db.Annonces
                }]
            })).map(elt => elt.dataValues)

            batiments[j].logements = logements
            batiments[j].nbrLogement = logements.length

            batiments[j].budgetAttendu = 0
            batiments[j].nbrAnnonce = 0

            for (let k = 0, taille = logements.length; k < taille; k++) {
                batiments[j].budgetAttendu += logements[k].prixMin
                logements[k].nbrAnnonce = logements[k].Annonces.length

                batiments[j].nbrAnnonce += logements[k].nbrAnnonce
            }

            cites[i].nbrLogement += batiments[j].nbrLogement
            cites[i].nbrAnnonce += batiments[j].nbrAnnonce
            cites[i].budgetAttendu += batiments[j].budgetAttendu
        }
    }

    return res.success(res.translate('cites_et_logements_associes'), cites)
}

/**
 * Edition des informations d'une nouvelle cite
 */
exports.edit = async(req, res) => {
    const nomCite = req.body.nom,
        refCite = req.body.ref,
        photo = req.body.photo,
        idCite = req.params.idCite

    const cite = await db.Cites.findByPk(idCite, { attributes: ['nomCite', 'refCite', 'image'] })

    try {
        if (empty(cite)) {
            return res.fail(res.translate('cite_inexistante'), 404)
        }
        let data = {
            nomCite: nomCite || cite.nomCite,
            refCite: refCite || cite.refCite,
            image: cite.image
        }
        if (!empty(photo) && photo != cite.image) {
            const url = uploadImage(photo, 'cites', md5(pij.uniqid()))
            if (!empty(url)) {
                if (!empty(cite.image)) {
                    removeImage(cite.image.split('static/')[1])
                }
                data.image = url
            }
        }

        await db.Cites.update(data, { where: { idCite } })

        return res.success(res.translate('cite_modifier_avec_succes'))
    } catch (err) {
        console.log('erreur', err)
        return res.fail(res.translate('erreur.process'))
    }
}

/**
 * Suppression d'une cité
 */
exports.remove = async(req, res) => {
    const force = req.query.force === 'true',
        idCite = req.params.idCite,
        where = idCite ? { idCite } : { idUtilisateur: req.user.idUtilisateur }

    if (force) {
        return exports.destroy(req, res)
    }
    await db.Cites.update({ statutCite: false }, { where })
    await db.Batiments.update({ statutBatiment: false }, { where })

    return res.success(res.translate('cite_supprimer_avec_succes'))
}
exports.destroy = async(req, res) => {
    const idCite = req.params.idCite,
        where = idCite ? { idCite } : { idUtilisateur: req.user.idUtilisateur }

    const datas = await db.Cites.findAll({ where, attributes: ['idCite', 'nomCite'] })

    let supprimables = [],
        nonSupprimables = []
    const tables = [db.Batiments],
        cites = datas.map(element => element.dataValues)

    for (let j = 0, count = cites.length; j < count; j++) {
        let exist = false,
            cite = cites[j]

        for (let i = 0, size = tables.length; i < size; i++) {
            exist = await tables[i].count({ where: { idCite: cite.idCite } })
            if (exist) {
                break
            }
        }

        if (exist) {
            nonSupprimables.push(cite.nomCite)
        } else {
            supprimables.push(cite.idCite)
        }
    }

    supprimables.forEach(async idCite => {
        await db.Cites.destroy({ where: { idCite } })
    })
    if (nonSupprimables.length) {
        return res.fail(res.translate('impossible_de_supprimer_les_cites', { cites: `" ${(nonSupprimables).join(', ')} "` }), 405)
    }
    return res.success(res.translate('suppression_effectuer_avec_succes'))
}

/**
 * Restauration de cite
 */
exports.restore = async(req, res) => {
    const idCite = req.params.idCite
    const where = idCite ? { idCite } : { idUtilisateur: req.user.idUtilisateur }

    await db.Cites.update({ statutCite: true }, { where })
    await db.Batiments.update({ statutBatiment: true }, { where })

    return res.success(res.translate('restauration_effectuer_avec_succes'))
}