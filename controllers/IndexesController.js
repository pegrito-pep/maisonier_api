const dayjs = require('dayjs')
const pij = require('php-in-js')
const { empty, in_array, date } = pij

const db = require('../models')
const { calcul_consommation_indexe } = require('../services/OccupationsService')
const { day } = require('../utils')


/**
 * Ajout d'un nouvel index
 */
exports.add = async(req, res) => {
    const typeIndexe = req.body.type,
        ancien = req.body.ancien,
        nouveau = req.body.nouveau,
        idLogement = req.body.idLogement || req.params.idLogement

    let periode = req.body.periode
    if (empty(periode)) {
        periode = date('Y-m')
    }
    periode = day().fromFormat(periode, ['YYYY-MM-DD', 'YYYY-MM', 'MM-YYYY', 'YYY-MM', 'MM-YYY']).format("YYYY-MM") + '-01';

    if (empty(typeIndexe) || empty(nouveau) || empty(idLogement)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (!in_array(typeIndexe, ['eau', 'energie'])) {
        return res.fail(res.translate('type_d_index_inconnu'), 400)
    }

    const lastIndexe = await db.Indexes.findOne({
        where: { idLogement, typeIndexe },
        order: [
            ['idIndexe', 'DESC']
        ]
    })
    if (empty(lastIndexe)) {
        return res.fail(res.translate('logement_inexistant'), 404)
    }
    if (lastIndexe.periode == periode) {
        return res.success(res.translate('les_indexes_de_cette_periode_ont_deja_ete_enregistrer'))
    }

    let idOccupation = null

    const occupation = await db.Occupations.findOne({
        where: {
            idLogement,
            dateFin: {
                [db.Op.is]: null
            }
        },
        order: [
            ['idOccupation', 'DESC']
        ],
        attributes: ['idOccupation']
    })
    if (!empty(occupation)) {
        idOccupation = occupation.idOccupation
    }
    const indexe = await db.Indexes.create({
        idLogement,
        idOccupation,
        typeIndexe,
        ancien: ancien || lastIndexe.nouveau,
        nouveau,
        periode
    })

    return res.success('Indexe ajouté avec succès', indexe)
}

exports.addMultiple = async(req, res) => {
    let periode = req.body.periode
    if (empty(periode)) {
        periode = date('Y-m')
    }
    periode = day().fromFormat(periode, ['YYYY-MM-DD', 'YYYY-MM', 'MM-YYYY', 'YYY-MM', 'MM-YYY']).format("YYYY-MM") + '-01';
    
    let indexes = req.body.indexes || []

    if (empty(indexes)) {
        return res.fail(res.translate('donnees_incompletes'), 400) 
    }

    const lastMonth = dayjs(periode).subtract(1, 'month').format('YYYY-MM') + '-01'

    for (let i = 0, size = indexes.length; i < size; i++) {
        const {eau, energie ,idLogement} = indexes[i]

        if (empty(eau) || empty(energie) || empty(idLogement)) {
            return res.fail(res.translate('donnees_incompletes'), 400)
        }
    
        let idOccupation = null
        const occupation = await db.Occupations.findOne({
            where: {
                idLogement,
                dateFin: {
                    [db.Op.is]: null
                }
            },
            order: [
                ['idOccupation', 'DESC']
            ],
            attributes: ['idOccupation', 'dateDeb']
        })
        let difMonth = -1
        if (!empty(occupation)) {
            idOccupation = occupation.idOccupation
            difMonth = dayjs(lastMonth).diff(dayjs(occupation.dateDeb).format('YYYY-MM')+'-01', 'month')
        }
    
        let current, data = {
            idLogement,
            idOccupation,
            periode
        }, lastIndexe = await db.Indexes.findOne({
            where: { idLogement, typeIndexe: 'eau', periode: lastMonth },
            order: [
                ['idIndexe', 'DESC']
            ]
        })
        data = Object.assign({}, data, {
            typeIndexe : 'eau',
            nouveau: eau[0] || 0,
            ancien: eau[1] || 0,
            avance: eau[2] || null,
        })
        let lastNouveau = !empty(lastIndexe) ? lastIndexe.nouveau : 0

        if (empty(lastIndexe)) {
            if (difMonth >= 0) {
                await db.Indexes.create(Object.assign({}, data, { ancien: 0, nouveau: 0, periode: lastMonth}))
                if (! await db.Indexes.count({ where: {idLogement, typeIndexe: 'eau', periode} })) {
                    await db.Indexes.create(data)
                }
            }
        }
        if (lastNouveau <= eau[0]) {
            current = await db.Indexes.findOne({where: {idLogement, typeIndexe: 'eau', periode}, order: [ ['idIndexe', 'DESC'] ] })
            if (!empty(current)) {
                if (empty(current.avance)) {
                    await db.Indexes.update(Object.assign({}, data, {
                        nouveau: eau[0] || current.nouveau,
                        ancien: eau[1] || current.ancien,
                        avance: eau[2] || current.avance,
                    }), {where: {idIndexe: current.idIndexe} })
                }
            }
            else {
                await db.Indexes.create(Object.assign({}, data, { ancien: eau[1] || lastNouveau  || 0}))
            }
        }
        
        lastIndexe = await db.Indexes.findOne({
            where: { idLogement, typeIndexe: 'energie', periode: lastMonth },
            order: [
                ['idIndexe', 'DESC']
            ]
        })
        data = Object.assign({}, data, {
            typeIndexe : 'energie',
            nouveau: energie[0],
            ancien: energie[1] || 0,
            avance: energie[2] || null,
        })
        lastNouveau = !empty(lastIndexe) ? lastIndexe.nouveau : 0

        if (empty(lastIndexe)) {
            if (difMonth >= 0) {
                await db.Indexes.create(Object.assign({}, data, { ancien: 0, nouveau: 0, periode: lastMonth}))
                if (! await db.Indexes.count({ where: {idLogement, typeIndexe: 'energie', periode} })) {
                    await db.Indexes.create(data)
                }
            }
        }
        if (lastNouveau <= energie[0]) {
            current = await db.Indexes.findOne({where: {idLogement, typeIndexe: 'energie', periode}, order: [ ['idIndexe', 'DESC'] ] })
            if (!empty(current)) {
                if (empty(current.avance)) {
                    await db.Indexes.update(Object.assign({}, data, {
                        nouveau: energie[0] || current.nouveau,
                        ancien: energie[1] || current.ancien,
                        avance: energie[2] || current.avance,
                    }), {where: {idIndexe: current.idIndexe} })
                }
            }
            else {
                await db.Indexes.create(Object.assign({}, data, { ancien: energie[1] || lastNouveau }))
            }
        }
    }
        
    return res.success('Indexes ajoutés avec succès')
}

/**
 * Liste de tous les index d'un logement
 */
exports.list = async(req, res) => {
    const idLogement = req.params.idLogement,
        idOccupation = req.params.idOccupation,
        idLocataire = req.params.idLocataire,
        typeIndexe = req.query.type,
        periode = req.query.periode

    if (empty(idLogement) && empty(idOccupation)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    let where = {}

    if (!empty(periode)) {
        where.periode = day().fromFormat(periode, ['YYYY-MM-DD', 'YYYY-MM', 'MM-YYYY', 'YYY-MM', 'MM-YYY']).format("YYYY-MM") + '-01';
    }
    if (!empty(typeIndexe) && in_array(typeIndexe, ['eau', 'energie'])) {
        where.typeIndexe = typeIndexe
    }
    if (!empty(idLogement)) {
        where.idLogement = idLogement
    } else if (!empty(idOccupation)) {
        where.idOccupation = idOccupation
    } else if (!empty(idLocataire)) {
        where.idLogement = (await db.Occupations.findAll({ attributes: ['idLogement'], where: { idLocataire } })).map(elt => elt.idLogement)
    }

    const indexes = (await db.Indexes.findAll({
        where,
        order: [
            ['idIndexe', 'DESC']
        ],
        include: !idLogement ? { model: db.Logements, as: 'logement' } : null
    })).map(elt => {
        const consommation = elt.consommation()
        elt = elt.dataValues
        elt.consommation = consommation
        return elt
    })

    return res.success('Indexes', indexes)
}

/**
 * Payer une consommation
 */
exports.buy = (req, res) => {
    const user = req.user,
        response = res.response

    const paiements = req.body.paiements

    if (!paiements || !(paiements instanceof Array)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    let updates = []
    for (let i = 0, size = paiements.length; i < size; i++) {
        const paiement = paiements[i],
            idIndexe = paiement.indexe,
            avance = paiement.avance,
            reste = paiement.reste || 0

        if (avance == '' || idIndexe == '') {
            return response.fail('Données invalides', 403)
        }
        updates.push({
            id: idIndexe,
            value: {
                avance,
                reste,
                datePaiement: new Date()
            }
        })
    }
    for (let i = 0, size = updates.length; i < size; i++) {
        db.Indexes.update(updates[i].value, { where: { idIndexe: updates[i].id } })
    }

    return response.success('Regement d\'indexe effectué avec succès')
}

/**
 * Paye un indexe consommé
 */
exports.pay = async(req, res) => {
    const idIndexe = req.params.idIndexe
    const montant = parseInt(req.body.montant || 0)

    if (montant < 1) {
        return res.fail(res.translate('entrer_un_montant_valide'), 400)
    }
    const indexe = await db.Indexes.findByPk(idIndexe)
    if (empty(indexe)) {
        return res.fail(res.translate('indexe_inexistant'), 404)
    }
    if (empty(indexe.idOccupation)) {
        return res.fail(res.translate('impossible_de_payer_cet_indexe_car_il_n_est_lier_a_aucune_occupation'), 403)
    }

    const comptePrincipal = await db.Comptes.findOne({
        where: {typeCompte: 'principal', idOccupation: indexe.idOccupation},
        include: [{ model: db.Occupations, as: 'occupation'}]
    })
    if (empty(comptePrincipal)) {
        return res.fail(res.translate('impossible_d_effectuer_le_paiement_car_l_occupation_n_a_pas_de_compte_principal'), 403)
    }
    if (comptePrincipal.solde < montant) {
        return res.fail(res.translate('le_compte_de_cette_occupation_n_a_pas_suffisament_d_argent_pour_effectuer_ce_paiement'), 403)
    }

    let paye = montant, reste = indexe.reste || 0
    if (!empty(indexe.reste) && montant >= reste) {
        paye = reste
    }
    if (paye > 0) {
        const consommation = calcul_consommation_indexe(comptePrincipal.occupation, indexe, indexe.typeIndexe)
        await db.Indexes.update({ avance: paye + indexe.avance || 0, reste: consommation - (paye + indexe.avance || 0), datePaiement: new Date() }, { where: {idIndexe} })
        comptePrincipal.solde -= paye
    }
    await db.Comptes.update({solde: comptePrincipal.solde}, {where: {idCompte: comptePrincipal.idCompte}})

    return res.success(res.translate('indexe_payer_avec_succes'))
}