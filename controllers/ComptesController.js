const { empty, is_array } = require("php-in-js")
const db = require("../models")

/**
 * Ajout d'un compte à une occupation
 */
exports.add = async(req, res) => {
    const {typeCompte, solde} = req.body
    const idOccupation = req.body.idOccupation || req.params.idOccupation || null 

    if (empty(idOccupation) || empty(typeCompte)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (! await db.Occupations.count({ where: {idOccupation} })) {
        return res.fail(res.translate('occupation_inexistante'), 404)
    }
    if (await db.Comptes.count({where: {idOccupation, typeCompte}})) {
        return res.fail(res.translate('un_compte_de_ce_type_existe_deja_pour_cette_occupation'), 409)
    }
    const compte = await db.Comptes.create({
        idOccupation,
        typeCompte,
        solde: solde || 0
    })
    return res.success(res.translate('compte_ajouter_avec_succes'), compte, 201)
}

exports.list = async(req, res) => {
    const idCompte = req.params.idCompte,
        idOccupation = req.params.idOccupation,
        idLocataire = req.params.idLocataire,
        idLogement = req.params.idLogement

    let where = {}
    if (!empty(idCompte)) {
        where.idCompte = idCompte
    }
    else if (!empty(idOccupation)) {
        where.idOccupation = idOccupation
    }
    else if (!empty(idLocataire)) {
        where.idOccupation = (await db.Occupations.findAll({ where: { idLocataire }, attributes: ['idOccupation'] })).map(elt => elt.idOccupation)
    }
    if (!empty(idLogement)) {
        where.idOccupation = (await db.Occupations.findAll({ where: { idLogement}, attributes: ['idOccupation'] })).map(elt => elt.idOccupation)
    }

    const comptes = await db.Comptes.findAll({
        where,
    })

    return res.success(res.translate('liste_des_comptes'), comptes)
}

/**
 * Recharge un compte
 */
exports.recharge = async(req, res) => {
    const idCompte = req.params.idCompte
    const montant = parseInt(req.body.montant || 0)
    const description = req.body.description || '', dateDepot = req.body.dateDepot || new Date()

    if (empty(montant) || montant < 1) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    const compte = await db.Comptes.findByPk(idCompte)

    if (empty(compte)) {
        return res.fail(res.translate('compte_inexistant'), 404)
    }

    const solde = parseInt(compte.solde) + montant

    await db.Comptes.update({solde}, {where: {idCompte}})
    await db.Depots.create({ idCompte, montant, description, dateDepot })

    return res.success(res.translate('compte_crediter_avec_succes'))
}

/**
 * Recharge de compte en masse
 */
exports.bulkRecharge = async(req, res) => {
    const comptes = req.body.comptes
    if (empty(comptes) || !is_array(comptes)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    const dateDepot = new Date()

    for (let i = 0; i < comptes.length; i++) {
        let {idOccupation, montant, description} = comptes[i] 
        const compte = await db.Comptes.findOne({where: {idOccupation, typeCompte: 'principal'}})

        if (empty(compte)) {
            return res.fail(res.translate('compte_inexistant'), 404)
        }
        montant = parseInt(montant || 0)
    
        if (montant > 0) {
            await db.Comptes.update({solde: parseInt(compte.solde) + montant}, {where: {idCompte: compte.idCompte}})
            await db.Depots.create({ idCompte: compte.idCompte, montant, description, dateDepot })
        }
    }
    
    return res.success(res.translate('compte_crediter_avec_succes'))
}