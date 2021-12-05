const pij = require('php-in-js')
const { empty, in_array, date } = pij

const db = require('../models')
const file = require('../utils/file')
const day = require('../utils/day')
const { generateRefCharge } = require('../utils/utils')

/**
 * Ajout d'une charge
 */
exports.add = async(req, res) => {
    const idTypeCharge = req.body.idTypeCharge,
        idOccupation = req.params.idOccupation,
        montant = req.body.montant,
        observation = req.body.observation,
        etatCharge = in_array(req.body.etatCharge, [true, 'true', 1, '1'])

    let periode = req.body.periode
    if (empty(periode)) {
        periode = date('Y-m')
    }
    periode = day().fromFormat(periode, ['YYYY-MM-DD', 'YYYY-MM', 'MM-YYYY', 'YYY-MM', 'MM-YYY']).format("YYYY-MM") + '-01';

    if (empty(idTypeCharge) || empty(idOccupation) || empty(montant)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (!await db.TypesCharges.count({ where: { idTypeCharge } })) {
        return res.fail(res.translate('type_de_charge_inconue'), 404)
    }
    const occupation = await db.Occupations.findByPk(idOccupation, {attributes: ['dateDeb']})
    if (empty(occupation)) {
        return res.fail(res.translate('occupation_inexistante'), 404)
    }
    if (day(periode).diff(day(occupation.dateDeb).format('YYYY-MM')+'-01', 'month') < 0) {
        return res.fail(res.translate('impossible_d_attribuer_une_charge_pour_cette_periode_car_l_occupation_n_existait_pas_en_ce_moment'), 403)
    }

    try {
        const reference = await generateRefCharge(db),
            data = {
                idOccupation,
                idTypeCharge,
                montant,
                periode,
                observation,
                etatCharge,
                reference
            },
            charge = await db.Charges.create(data)

        if (etatCharge == true) {
            file.saveSync(charge.dataValues, 'db/charges')
        }
        return res.success(res.translate('charge_ajouter_avec_succes'), charge, 201)
    } catch (error) {
        console.log(error);
        return res.fail(res.translate('erreur.process'))
    }
}

/**
 * Liste des charges
 */
exports.list = async(req, res) => {
    const idTypeCharge = req.params.idTypeCharge || req.query.typeCharge,
        idOccupation = req.params.idOccupation || req.query.occupation,
        idLocataire = req.params.idLocataire || req.query.locataire,
        idLogement = req.params.idLogement || req.query.logement

    let where = {}
    if (!empty(idOccupation)) {
        where.idOccupation = idOccupation
    }
    if (!empty(idTypeCharge)) {
        where.idTypeCharge = idTypeCharge
    }
    if (!empty(idLocataire)) {
        where.idOccupation = (await db.Occupations.findAll({ where: { idLocataire }, attributes: ['idOccupation'] })).map(elt => elt.idOccupation)
    }
    if (!empty(idLogement)) {
        where.idOccupation = (await db.Occupations.findAll({ where: { idLogement}, attributes: ['idOccupation'] })).map(elt => elt.idOccupation)
    }

    const charges = await db.Charges.findAll({
        where,
        include: [
            { model: db.Occupations, as: 'occupation' },
            { model: db.TypesCharges, as: 'typeCharge' }
        ],
        order: [['periode', 'DESC']]
    })

    return res.success(res.translate('liste_des_charges'), charges)
}

/**
 * chane (active ou desactive) une charge
 */
exports.toggleState = async(req, res) => {
    const idCharge = req.params.idCharge

    const charge = await db.Charges.findByPk(idCharge)

    if (empty(charge)) {
        return res.fail(res.translate('charge_inexistante'), 404)
    }
    if (false == charge.etatCharge) {
        file.remove((elt) => elt.reference == charge.reference, 'db/charges')
    }
    else {
        file.saveSync(charge.dataValues, 'db/charges')
    }
    await db.Charges.update({etatCharge: !charge.etatCharge}, {where: {reference: charge.reference}})

    return res.success(res.translate('etat_de_la_charge_modifier_avec_succes'))
}

/**
 * Auto generation de charges
 */
exports.generateCharge = async(req, res) => {
    let periode = req.body.periode
    if (empty(periode)) {
        periode = date('Y-m')
    }
    periode = day().fromFormat(periode, ['YYYY-MM-DD', 'YYYY-MM', 'MM-YYYY', 'YYY-MM', 'MM-YYY']).format("YYYY-MM") + '-01';

    let autoGenerate = file.getSync('db/charges'), nbr = 0
    if (empty(autoGenerate)) {
        return res.fail(res.translate('aucune_charge_a_generer'), 404)
    }
    for (let i = 0; i < autoGenerate.length; i++) {
        const charge = autoGenerate[i]

        const occupation = await db.Occupations.findByPk(charge.idOccupation, {attributes: ['dateDeb']})
        if (empty(occupation)) {
            continue
        }
        if (day(periode).diff(day(occupation.dateDeb).format('YYYY-MM')+'-01', 'month') < 0) {
            continue
        }
    
        if (charge.etatCharge == true && ! await db.Charges.count({ where: {reference: charge.reference, periode} })) {
            await db.Charges.create({
                idOccupation: charge.idOccupation,
                idTypeCharge: charge.idTypeCharge,
                montant: charge.montant,
                periode,
                observation: charge.observation,
                etatCharge: charge.etatCharge,
                reference: charge.reference
            })
            nbr++
        }
    } 

    if (nbr < 1) {
        return res.success(res.translate('aucune_charge_generer_mais_le_processus_s_est_bien_terminer'))
    }
    return res.success(res.translate('charges_generer_avec_succes', {nbr}));
}

exports.buy = async(req, res) => {
    const idCharge = req.params.idCharge
    const montant = parseInt(req.body.montant || 0)

    if (montant < 1) {
        return res.fail(res.translate('entrer_un_montant_valide'), 400)
    }
    const charge = await db.Charges.findByPk(idCharge)
    if (empty(charge)) {
        return res.fail(res.translate('charge_inexistante'), 404)
    }

    const comptePrincipal = await db.Comptes.findOne({where: {typeCompte: 'principal', idOccupation: charge.idOccupation}})
    if (empty(comptePrincipal)) {
        return res.fail(res.translate('impossible_d_effectuer_le_paiement_car_l_occupation_n_a_pas_de_compte_principal'), 403)
    }
    if (comptePrincipal.solde < montant) {
        return res.fail(res.translate('le_compte_de_cette_occupation_n_a_pas_suffisament_d_argent_pour_effectuer_ce_paiement'), 403)
    }

    let paye = montant, reste = charge.montant - charge.montantPayer
    if (montant >= reste) {
        paye = reste
    }
    if (paye > 0) {
        await db.Charges.update({ montantPayer: paye + charge.montantPayer, datePaiement: new Date() }, { where: {idCharge} })
        comptePrincipal.solde -= paye
    }
    await db.Comptes.update({solde: comptePrincipal.solde}, {where: {idCompte: comptePrincipal.idCompte}})

    return res.success(res.translate('charge_payer_avec_succes'))
}