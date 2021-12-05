const md5 = require('md5')
const pij = require('php-in-js')
const { empty } = pij

const db = require('../models')
const repo = require('../repositories')
const { uploadImage, generateKey } = require('../utils/utils')

/**
 * Ajouter une depenses
 */
exports.add = async(req, res) => {
    const motif = req.body.motif,
        dateDepense = req.body.date,
        montant = req.body.montant,
        observation = req.body.observation,
        nomResponsable = req.body.responsable,
        photo = req.body.photo,
        idCite = req.params.idCite || req.body.idCite || null,
        idBatiment = req.params.idBatiment || req.body.idBatiment || null,
        idLogement = req.params.idLogement || req.body.idLogement || null

    if (empty(motif) || empty(montant) || empty(dateDepense) || empty(nomResponsable)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (empty(idBatiment) && empty(idCite) && empty(idLogement)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }

    if (!empty(idBatiment) && !await db.Batiments.count({ where: { idBatiment } })) {
        return res.fail(res.translate('batiment_inexistant'), 404)
    }
    if (!empty(idCite) && !await db.Cites.count({ where: { idCite } })) {
        return res.fail(res.translate('cite_inexistante'), 404)
    }
    if (!empty(idLogement) && !await db.Logements.count({ where: { idLogement } })) {
        return res.fail(res.translate('logement_inexistant'), 404)
    }

    let numero
    do {
        numero = generateKey(10)
    }
    while (await db.Depenses.count({ where: { numero } }))

    let data = {
        dateDepense,
        montant,
        observation,
        nomResponsable,
        idCite,
        idBatiment,
        idLogement,
        numero,
        motif,
        photo: ''
    }
    if (!empty(photo)) {
        data.photo = uploadImage(photo, 'depenses', md5(pij.uniqid()))
    }
    const depense = await db.Depenses.create(data)

    return res.success(res.translate('depenses_ajoutee'), depense, 201)
}

/**
 * Liste des depenses
 */
exports.list = async(req, res) => {
    const idLogement = req.params.idLogement,
        idCite = req.params.idCite,
        idBatiment = req.params.idBatiment

    let where = {}

    if (!empty(idCite)) {
        where.idCite = idCite
    }
    else if (!empty(idBatiment)) {
        where.idBatiment = idBatiment
    }
    else if (!empty(idLogement)) {
        where.idLogement = idLogement
    }
    else {
        where[db.Op.or] = {
            idBatiment: (await repo.Bailleur.batiments(req.user.idUtilisateur)).map(elt => elt.idBatiment),
            idCite: (await repo.Bailleur.cites(req.user.idUtilisateur)).map(elt => elt.idCite),
            idLogement: (await repo.Bailleur.logements(req.user.idUtilisateur)).map(elt => elt.idLogement)
        }
    }

    let depenses = await db.Depenses.findAll({ where, include: [
        { model: db.Cites, as: 'cite' },
        { model: db.Batiments, as: 'batiment' },
        { model: db.Logements, as: 'logement' }
    ] })

    return res.success(res.translate('depenses'), depenses)
}

/**
 * Depenses totales
 */
exports.totales = async(req, res) => {
    const idBatiment = req.params.idBatiment,
        idCite = req.params.idCite,
        idLogement = req.params.idLogement

    let where = {}
    if (!empty(idCite)) {
        where.idCite = idCite
    }
    if (!empty(idBatiment)) {
        where.idBatiment = idBatiment
    }
    if (!empty(idLogement)) {
        where.idLogement = idLogement
    }
    if (!empty(req.user)) {
        where[db.Op.or] = {
            idBatiment: (await repo.Bailleur.batiments(req.user.idUtilisateur)).map(elt => elt.idBatiment),
            idCite: (await repo.Bailleur.cites(req.user.idUtilisateur)).map(elt => elt.idCite),
            idLogement: (await repo.Bailleur.logements(req.user.idUtilisateur)).map(elt => elt.idLogement)
        }
    }

    let depenses = (await db.Depenses.findAll({ where })).map(elt => elt.dataValues),
        totales = depenses

    if (!empty(idBatiment)) {
        depenses = (await db.Depenses.findAll({
            where: {
                idLogement: (await db.Logements.findAll({ where: { idBatiment }, attributes: ['idLogement'] })).map(elt => elt.idLogement)
            }
        })).map(elt => elt.dataValues)

        totales = [...totales, ...depenses]
    }

    if (!empty(idCite)) {
        const batiments = (await db.Batiments.findAll({ where: { idCite }, attributes: ['idBatiment'] })).map(elt => elt.idBatiment)

        depenses = (await db.Depenses.findAll({ where: { idBatiment: batiments } })).map(elt => elt.dataValues)
        totales = [...totales, ...depenses];

        depenses = (await db.Depenses.findAll({
            where: {
                idLogement: (await db.Logements.findAll({ where: { idBatiment: batiments }, attributes: ['idLogement'] })).map(elt => elt.idLogement)
            }
        })).map(elt => elt.dataValues)

        totales = [...totales, ...depenses]
    }

    let montantTotal = 0;
    totales.forEach(depense => {
        montantTotal += depense.montant
    })

    return res.success(res.translate('depenses_totales'), {
        montantTotal,
        depenses: totales
    })
}