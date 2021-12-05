const pij = require('php-in-js')
const { empty } = pij

const db = require('../models')
const bailleurRepo = require('../repositories/BailleurRepo')

/**
 * Ajout d'un nouveau contrat
 */
exports.create = async(req, res) => {
    const idOccupation = req.body.idOccupation || req.params.idOccupation,
        contenu = req.body.contenu
        
    if (empty(idOccupation) || empty(contenu)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }

    if (! await db.Occupations.count({ where: { idOccupation } })) {
        return res.fail(res.translate('occupation_inexistante'), 404)
    }
    if (await db.Contrats.count({ where: {idOccupation} })) {
        return res.fail(res.translate('cette_occupation_possede_deja_un_contrat'), 409)
    }
    
    try {
        const contrat = await db.Contrats.create({ contenu, idOccupation })
        
        return res.success(res.translate('contrat_creer_avec_succes'), contrat, 201)
    } catch (error) {
        console.log(error);
        return res.fail(res.translate('erreur.process'))
    }
}

/**
 * Liste des contrats
 */
exports.list = async(req, res) => {
    const { idContrat, idOccupation, idLogement, idLocataire } = req.params

    let where = {}
    if (!empty(idContrat)) {
        where.idContrat = idContrat
    }
    else if (!empty(idOccupation)) {
        where.idOccupation = idOccupation
    }
    else if (!empty(idLogement)) {
        where.idOccupation = (await db.Occupations.findAll({ where: { idLogement }, attributes: ['idOccupation']})).map(elt => elt.idOccupation)
    }
    else if (!empty(idLocataire)) {
        where.idOccupation = (await db.Occupations.findAll({ where: { idLocataire }, attributes: ['idOccupation']})).map(elt => elt.idOccupation)
    }
    else {
        where.idOccupation = (await bailleurRepo.occupations(req.user.idUtilisateur)).map(elt => elt.idOccupation)
    }
    let contrats = await db.Contrats.findAll({ where })

    if (!empty(idContrat)) {
        if (empty(contrats)) {
            return res.fail(res.translate('contrat_inexistant'), 404)
        }
        contrats = contrats.shift()
    }
    if (!empty(idOccupation) && !empty(contrats)) {
        contrats = contrats.shift()
    }

    return res.success(res.translate('contrats'), contrats)
}

/**
 * Edition des informations d'un contrat
 */
 exports.edit = async(req, res) => {
    const contenu = req.body.contenu,
        idOccupation = req.body.idOccupation,
        idContrat = req.params.idContrat

    const contrat = await db.Contrats.findByPk(idContrat)

    if (empty(contrat)) {
        return res.fail(res.translate('contrat_inexistant'), 404)
    }
    if (!empty(idOccupation) && ! await db.Occupations.count({ where: {idOccupation} })) {
        return res.fail(res.translate('occupation_inexistante'), 404)
    }
    await db.Contrats.update({
        contenu: contenu || contrat.contenu,
        idOccupation: idOccupation || contrat.idOccupation
    }, { where: { idContrat } })

    return res.success(res.translate('contrat_modifier_avec_succes'))
}

/**
 * Suppression d'un template de contrat
 */
exports.remove = async(req, res) => {
    const idContrat = req.params.idContrat

    await db.Contrats.destroy({ where: { idContrat } })

    return res.success(res.translate('suppression_effectuer_avec_succes'))
}