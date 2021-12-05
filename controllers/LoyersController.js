const { empty, date, in_array } = require('php-in-js')
const db = require('../models')
const repo = require('../repositories')
const { day } = require('../utils')

/**
 * (Depecated) Enregistre les loyers générés d'un bailleur
 */
exports.saveGenerate = async(req, res) => {
    let periode = req.body.periode
    if (empty(periode)) {
        periode = date('Y-m')
    }
    periode = day().fromFormat(periode, ['YYYY-MM-DD', 'YYYY-MM', 'MM-YYYY', 'YYY-MM', 'MM-YYY']).format("YYYY-MM") + '-01';

    const occupations = await repo.Bailleur.occupations(req.user.idUtilisateur)

    let nbrGenerer = 0
    for (let i = 0, size = occupations.length; i < size; i++) {
        const occupation = occupations[i]
        if (!await db.Loyers.count({ where: { idOccupation: occupation.idOccupation, periode } })) {
            await db.Loyers.create({
                idOccupation: occupation.idOccupation,
                periode,
                montant: occupation.loyerBase
            })
            nbrGenerer++
        }
    }

    if (nbrGenerer < 1) {
        return res.success(res.translate('tous_les_loyers_ont_deja_ete_generer_pour_cette_periode'))
    }
    return res.success(res.translate('loyers_generer_avec_succes', { nbr: nbrGenerer }))
}

/**
 * Genere les loyers mensuels d'un bailleur
 */
exports.generate = async(req, res) => {
    let periode = req.query.periode
    if (empty(periode)) {
        periode = date('Y-m')
    }
    periode = day().fromFormat(periode, ['YYYY-MM-DD', 'YYYY-MM', 'MM-YYYY', 'YYY-MM', 'MM-YYY']).format("YYYY-MM") + '-01';

    const occupations = (await repo.Bailleur.occupations(req.user.idUtilisateur, [
        { model: db.Logements, as: 'logement', include: [
            {model: db.SousTypesLogements, as: 'sousTypeLogement'},
            {model: db.Batiments, as: 'batiment', include: [
                {model: db.Adresses, as: 'adresse'},
            ]},
            {model: db.Adresses, as: 'adresse'},
        ] },
        { model: db.Locataires, as: 'locataire' }
    ])).map(elt => elt.dataValues).filter(elt => {
        return (day(periode).diff(elt.dateDeb, 'month') >= 0 && (empty(elt.dateFin) || day(elt.dateFin).diff(periode, 'month') <= 0))
    })

    for (let i = 0; i < occupations.length; i++) {
        occupations[i].charges = await db.Charges.findAll({where: {periode, idOccupation: occupations[i].idOccupation}})
        occupations[i].loyers = await db.Loyers.findAll({where: {periode, idOccupation: occupations[i].idOccupation}})
        occupations[i].indexes = await db.Indexes.findAll({where: {periode, idOccupation: occupations[i].idOccupation}})
    }

    return res.success(res.translate('loyers'), occupations)
}

/**
 * Liste des loyers
 */
exports.list = async(req, res) => {
    const idLogement = req.params.idLogement,
        idOccupation = req.params.idOccupation,
        idLocataire = req.params.idLocataire,
        periode = req.query.periode

    let where = {}

    if (!empty(periode)) {
        where.periode = day().fromFormat(periode, ['YYYY-MM-DD', 'YYYY-MM', 'MM-YYYY', 'YYY-MM', 'MM-YYY']).format("YYYY-MM") + '-01';
    }

    if (!empty(idLogement)) {
        where.idOccupation = (await db.Occupations.findAll({ where: { idLogement }, attributes: ['idOccupation'] })).map(elt => elt.idOccupation)
    } else if (!empty(idLocataire)) {
        where.idOccupation = (await db.Occupations.findAll({ where: { idLocataire }, attributes: ['idOccupation'] })).map(elt => elt.idOccupation)
    } else if (!empty(idOccupation)) {
        where.idOccupation = idOccupation
    } else {
        where.idOccupation = (await repo.Bailleur.occupations(req.user.idUtilisateur)).map(elt => elt.idOccupation)
    }

    const loyers = await db.Loyers.findAll({
        where,
        include: [{ model: db.Occupations, as: 'occupation' }]
    })

    return res.success(res.translate('loyers'), loyers)
}

/**
 * Payer tous les loyers d'un bailleur
 */
exports.autoPay = async(req, res) => {
    let periode = req.body.periode
    if (empty(periode)) {
        periode = date('Y-m')
    }
    periode = day().fromFormat(periode, ['YYYY-MM-DD', 'YYYY-MM', 'MM-YYYY', 'YYY-MM', 'MM-YYY']).format("YYYY-MM") + '-01';

    const occupations = await repo.Bailleur.occupations(req.user.idUtilisateur, [
        { model: db.Comptes, as: 'comptes' },
        { model: db.Charges, as: 'charges' },
        { model: db.Loyers, as: 'loyers' },
        { model: db.Indexes, as: 'indexes' },
    ])

    let nbrPayer = 0
    for (let i = 0, size = occupations.length; i < size; i++) {
        const occupation = occupations[i]
        const comptePrincipal = occupation.comptes.find(elt => elt.typeCompte == 'principal')
        if (empty(comptePrincipal)) {
            continue
        }
        let solde = parseInt(comptePrincipal.solde)

        const loyer = occupation.loyers.find(elt => day(elt.periode).format('YYYY-MM')+'-01' == periode)
        const indexes = occupation.indexes.filter(elt => day(elt.periode).format('YYYY-MM')+'-01' == periode)
        const charges = occupation.charges.filter(elt => day(elt.periode).format('YYYY-MM')+'-01' == periode)

        if (empty(loyer)) {
            let paye = solde >= parseInt(occupation.loyerBase) ? occupation.loyerBase : 0
            await db.Loyers.create({
                idOccupation: occupation.idOccupation,
                periode,
                montant: occupation.loyerBase,
                montantPayer: paye,
                datePaiement: new Date()
            })
            if (paye > 0) {
                solde -= occupation.loyerBase
                nbrPayer++
            }
        }
        for (let i = 0; i < charges.length; i++) {
            const charge = charges[i]
            if (solde >= parseInt(charge.montant) && empty(charge.montantPayer)) {
                await db.Charges.update({
                    montantPayer: charge.montant,
                    datePaiement: new Date(),
                }, {where: {idCharge: charge.idCharge}})

                solde -= charge.montant
            }
        }
        for (let i = 0; i < indexes.length; i++) {
            const indexe = indexes[i],
                consommation = calcul_consommation(occupation, indexe, indexe.typeIndexe)

            if (solde >= consommation && empty(indexe.avance)) {
                await db.Indexes.update({
                    avance: consommation,
                    reste: 0,
                    datePaiement: new Date(),
                }, {where: {idIndexe: indexe.idIndexe}})

                solde -= consommation
            }
        }
        
        await db.Comptes.update({solde}, {where: {idCompte: comptePrincipal.idCompte}})
    }

    return res.success(res.translate('loyers_payer_avec_succes', { nbr: nbrPayer }))
}

/**
 * Paye une facture individuelle
 */
exports.payFacture = async(req, res) => {
    const idOccupation = req.body.idOccupation || req.params.idOccupation
    const paye_loyer = in_array(req.body.loyer, [true, 'true', 1, '1']),
        paye_eau = in_array(req.body.eau, [true, 'true', 1, '1']),
        paye_energie = in_array(req.body.energie, [true, 'true', 1, '1']),
        paye_charges = in_array(req.body.charges, [true, 'true', 1, '1'])
        
    let montant = parseInt(req.body.montant || 0), periode = req.body.periode
    
    if (empty(idOccupation) || empty(montant)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (empty(periode)) {
        periode = day(false).format('YYYY-MM') + '-01'
    }

    const occupation = await db.Occupations.findByPk(idOccupation, {
        include: [
            { model: db.Comptes, as: 'comptes' },
            { model: db.Charges, as: 'charges' },
            { model: db.Loyers, as: 'loyers' },
            { model: db.Indexes, as: 'indexes' },
        ]
    })
    if (empty(occupation)) {
        return res.fail(res.translate('occupation_inexistante'), 404)
    }

    const comptePrincipal = occupation.comptes.find(elt => elt.typeCompte == 'principal')
    if (empty(comptePrincipal)) {
        return res.fail(res.translate('impossible_d_effectuer_le_paiement_car_l_occupation_n_a_pas_de_compte_principal'), 403)
    }
    if (comptePrincipal.solde < montant) {
        return res.fail(res.translate('le_compte_de_cette_occupation_n_a_pas_suffisament_d_argent_pour_effectuer_ce_paiement'), 403)
    }
    const loyer = occupation.loyers.find(elt => day(elt.periode).format('YYYY-MM')+'-01' == periode)
    const indexes = occupation.indexes.filter(elt => day(elt.periode).format('YYYY-MM')+'-01' == periode)
    const charges = occupation.charges.filter(elt => day(elt.periode).format('YYYY-MM')+'-01' == periode)
    let paye = 0, reste = 0
    
    if (montant > 0 && true == paye_loyer) {
        paye = montant
        if (empty(loyer)) {
            if (montant >= occupation.loyerBase) {
                paye = occupation.loyerBase
            }
            await db.Loyers.create({
                idOccupation: occupation.idOccupation,
                periode,
                montant: occupation.loyerBase,
                montantPayer: paye,
                datePaiement: new Date()
            })
            montant -= paye
            comptePrincipal.solde -= paye
        }
        else {
            reste = loyer.montant - loyer.montantPayer
            if (montant >= reste) {
                paye = reste
            }
            if (paye > 0) {
                await db.Loyers.update({ montantPayer: paye + loyer.montantPayer, datePaiement: new Date() }, { where: {idLoyer: loyer.idLoyer} })
                montant -= paye
                comptePrincipal.solde -= paye
            }
        }
    }
    if (montant > 0 && true == paye_charges) {
        let i = 0
        paye = montant

        while (i < charges.length ) {
            reste = charges[i].montant - charges[i].montantPayer
            if (montant >= reste) {
                paye = reste
            }
            if (paye > 0) {
                await db.Charges.update({ montantPayer: paye + charges[i].montantPayer, datePaiement: new Date() }, { where: {idCharge: charges[i].idCharge} })
                montant -= paye
                comptePrincipal.solde -= paye
            }
            i++
        }
    }
    if (montant > 0 && true == paye_eau) {
        paye = montant
        const indexe_eau = indexes.find(elt => elt.typeIndexe == 'eau')
        if (!empty(indexe_eau)) {
            let consommation = calcul_consommation(occupation, indexe_eau, 'eau')
            if (montant >= consommation) {
                paye = consommation + (indexe_eau.avance || 0)
            }
            if (!empty(indexe_eau.reste) && indexe_eau.reste > 0 && montant >= indexe_eau.reste) {
                paye = indexe_eau.reste + (indexe_eau.avance || 0)
            }
            if (paye > 0) {
                await db.Indexes.update({
                    avance: paye,
                    reste: consommation - paye,
                    datePaiement: new Date(),
                }, {where: {idIndexe: indexe_eau.idIndexe}})
                montant -= paye
                comptePrincipal.solde -= paye
            }
        }
    }
    if (montant > 0 && true == paye_energie) {
        paye = montant
        const indexe_energie = indexes.find(elt => elt.typeIndexe == 'energie')
        if (!empty(indexe_energie)) {
            let consommation = calcul_consommation(occupation, indexe_energie, 'energie')
            if (montant >= consommation) {
                paye = consommation + (indexe_energie.avance || 0)
            }
            if (!empty(indexe_energie.reste) && indexe_energie.reste > 0 && montant >= indexe_energie.reste) {
                paye = indexe_energie.reste + (indexe_energie.avance || 0)
            }
            if (paye > 0) {
                await db.Indexes.update({
                    avance: paye,
                    reste: consommation - paye,
                    datePaiement: new Date(),
                }, {where: {idIndexe: indexe_energie.idIndexe}})
                montant -= paye
                comptePrincipal.solde -= paye
            }
        }
    }
    
    await db.Comptes.update({solde: comptePrincipal.solde}, {where: {idCompte: comptePrincipal.idCompte}})

    return res.success(res.translate('facture_payer_avec_succes'))
}

/**
 * Paye un loyer
 */
exports.buy = async(req, res) => {
    const idLoyer = req.params.idLoyer
    const montant = parseInt(req.body.montant || 0)

    if (montant < 1) {
        return res.fail(res.translate('entrer_un_montant_valide'), 400)
    }
    const loyer = await db.Loyers.findByPk(idLoyer)
    if (empty(loyer)) {
        return res.fail(res.translate('loyer_inexistant'), 404)
    }

    const comptePrincipal = await db.Comptes.findOne({
        where: {typeCompte: 'principal', idOccupation: loyer.idOccupation},
        include: [{ model: db.Occupations, as: 'occupation'}]
    })
    if (empty(comptePrincipal)) {
        return res.fail(res.translate('impossible_d_effectuer_le_paiement_car_l_occupation_n_a_pas_de_compte_principal'), 403)
    }
    if (comptePrincipal.solde < montant) {
        return res.fail(res.translate('le_compte_de_cette_occupation_n_a_pas_suffisament_d_argent_pour_effectuer_ce_paiement'), 403)
    }

    let paye = montant, reste = loyer.montant - loyer.montantPayer || 0
    if (loyer.montantPayer != null && montant >= reste) {
        paye = reste
    }
    if (paye > 0) {
        await db.Loyers.update({ montantPayer: paye + loyer.montantPayer, datePaiement: new Date() }, { where: {idLoyer} })
        comptePrincipal.solde -= paye
    }
    await db.Comptes.update({solde: comptePrincipal.solde}, {where: {idCompte: comptePrincipal.idCompte}})

    return res.success(res.translate('loyer_payer_avec_succes'))
}


const calcul_consommation = (occupation, indexe, type) => {
    let mode = occupation.modeEau, 
        pu = occupation.puEau,
        consommation = 1
        
    if ('energie' == type) {
        mode = occupation.modeEnergie
        pu = occupation.puEnergie
    }
    if (mode == 'index') {
        consommation = indexe.nouveau - indexe.ancien
    }

    return consommation * pu
}