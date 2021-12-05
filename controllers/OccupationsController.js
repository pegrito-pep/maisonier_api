const dayjs = require('dayjs')
const pij = require('php-in-js')
const { empty, in_array } = pij

const db = require('../models')
const bailleurRepo = require('../repositories/BailleurRepo')
const occupationsService = require('../services/OccupationsService')

/**
 * Ajout d'une nouvelle occupation (locataire - utilisateur dans un logement)
 */
exports.add = async(req, res) => {
    const loyerBase = req.body.loyer,
        modePaiement = req.body.mode,
        dateDeb = req.body.dateDeb || (req.body.debut || new Date()),
        modeEnergie = req.body.energie,
        modeEau = req.body.eau,
        puEnergie = req.body.puEnergie,
        puEau = req.body.puEau,
        indexEnergie = req.body.indexEnergie, 
        indexEau = req.body.indexEau,
        idLogement = req.body.idLogement,
        idLocataire = req.body.idLocataire,
        endLastBail = req.body.endLastBail,
        avance = parseInt(req.body.avance || 0),
        caution = parseInt(req.body.caution || 0),
        dureeBail = req.body.dureeBail,
        contrat = req.body.contrat

    if (empty(loyerBase) || empty(modePaiement) || empty(modeEnergie) || empty(modeEau) || empty(puEnergie) || empty(puEau) || empty(idLogement) || empty(idLocataire) || empty(dureeBail)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (!in_array(modeEau, ['index', 'forfait']) || !in_array(modeEnergie, ['index', 'forfait'])) {
        return res.fail(res.translate('mode_de_paiement_d_eau_ou_d_energie_invalide'), 403)
    }
    if (!await db.Locataires.count({ where: { idLocataire } })) {
        return res.fail(res.translate('locataire_inexistant'), 404);
    }
    const logement = await db.Logements.findByPk(idLogement, { include: [{model: db.Indexes, as: 'indexes'}] })
    if (!logement) {
        return res.fail(res.translate('logement_inexistant'), 404)
    }
    if (loyerBase < logement.prixMin || loyerBase > logement.prixMax) {
        return res.fail(res.translate('le_loyer_de_base_doit_etre_entre_les_prix', {
            min: logement.prixMin,
            max: logement.prixMax,
            devise: 'F'
        }), 400)
    }
    if (logement.etatLogement) {
        if (true != endLastBail) {
            return res.fail(res.translate('ce_logement_est_acctuellement_occuper'), 406)
        }
        await db.Occupations.update({dateFin: new Date()}, { where: {
            idLogement,
            dateFin: {
                [db.Op.is]: null
            }
        }})
    }
    try {
        const occupation = await db.Occupations.create({
            loyerBase,
            modePaiement,
            modeEnergie,
            modeEau,
            puEnergie,
            puEau,
            idLogement,
            idLocataire,
            caution,
            dateDeb: dateDeb,
            dureeBail
        })
        await db.Logements.update({ etatLogement: true }, { where: { idLogement } })

        const indexe = logement.indexes.sort((a, b) => {
            return dayjs().diff(b.periode) - dayjs().diff(a.periode)
        })
        
        const lastIndex = {
            eau: indexe.find(elt => elt.typeIndexe == 'eau'),
            energie: indexe.find(elt => elt.typeIndexe == 'energie')
        }
        await db.Indexes.bulkCreate(['eau', 'energie'].map(typeIndexe => {
            let ancien = 0
            if (typeIndexe == 'eau') {
                if (!empty(indexEau) || indexEau === 0) {
                    ancien = indexEau
                }
                else if (lastIndex.eau) {
                    ancien = lastIndex.eau.ancien || 0
                }
            }
            if (typeIndexe == 'energie') {
                if (!empty(indexEnergie) || indexEnergie === 0) {
                    ancien = indexEnergie
                }
                else if (lastIndex.energie) {
                    ancien = lastIndex.energie.ancien || 0
                }
            }
            return {
                typeIndexe,
                idLogement,
                idOccupation: occupation.idOccupation,
                ancien,
                nouveau: ancien,
                periode: dayjs(dateDeb).format('YYYY-MM') + '-01'
            }
        }))
        await db.Comptes.bulkCreate(['principal'].map(typeCompte => {
            return {
                typeCompte,
                idOccupation: occupation.idOccupation,
                solde: 0
            }
        }))

        let periode = dayjs(dateDeb), jour = periode.format('DD')
        if (jour > 15) {
            periode = periode.add(1, 'month')
        }
        for (let i = 0; i < avance; i++) {
            await db.Loyers.create({
                idOccupation: occupation.idOccupation,
                montant: occupation.loyerBase,
                montantPayer: occupation.loyerBase,
                periode: periode.add(i, 'month').format('YYYY-MM') + '-01',
                datePaiement: new Date()
            })
        }

        if (!empty(contrat)) {
            await db.Contrats.create({ contenu: contrat, idOccupation: occupation.idOccupation })
        }

        return res.success(res.translate('occupation_creer_avec_succes'), occupation)
    } catch (error) {
        console.log(error);
        return res.fail(res.translate('erreur.process'))
    }
}

/**
 * Liste de toutes les occupations d'un locataire
 */
exports.list = async(req, res) => {
    const idLogement = req.params.idLogement,
        idLocataire = req.params.idLocataire

    let where = {}
    if (idLogement) {
        where.idLogement = idLogement
    }
    if (idLocataire) {
        where.idLocataire = idLocataire
    }
    if (!idLogement && !idLocataire) {
        let ids = (await bailleurRepo.logements(req.user.idUtilisateur)).map(elt => elt.idLogement)
        if (!empty(ids)) {
            where.idLogement = ids
        }
    }
    
    let occupations = (await db.Occupations.findAll({
        where,
        include: [
            { model: db.Logements, as: 'logement', include: [
                {model: db.SousTypesLogements, as: 'sousTypeLogement'},
            ] },
            { model: db.Locataires, as: 'locataire' },
            { model: db.Charges, as: 'charges' },
            { model: db.Loyers, as: 'loyers' },
            { model: db.Indexes, as: 'indexes' },
        ]
    })).map(elt => elt.dataValues)
    
    for (let occupation of occupations) {
        occupation.impayerCharges = occupationsService.calcul_impayes(occupation, 'charges')
        occupation.impayerEau = occupationsService.calcul_impayes(occupation, 'eau')
        occupation.impayerEnergie = occupationsService.calcul_impayes(occupation, 'energie')
        occupation.impayerLoyer = occupationsService.calcul_impayes(occupation, 'loyer')
        occupation.impayerTotal = occupation.impayerCharges + occupation.impayerEau + occupation.impayerEnergie + occupation.impayerLoyer 

        delete occupation.charges 
        delete occupation.indexes

        occupation.solde = (await db.Comptes.findAll({where: {idOccupation: occupation.idOccupation}, attributes: ['solde']})).reduce((accumulator, current) => accumulator + current.solde, 0)
    }
    
    return res.success(res.translate('liste_des_occupations'), occupations)
}

/**
 * Liste de toutes les occupations d'un locataire
 */
exports.listLite = async(req, res) => {
    const idLogement = req.params.idLogement,
        idLocataire = req.params.idLocataire

    let where = {}
    if (idLogement) {
        where.idLogement = idLogement
    }
    if (idLocataire) {
        where.idLocataire = idLocataire
    }
    if (!idLogement && !idLocataire) {
        let ids = (await bailleurRepo.logements(req.user.idUtilisateur)).map(elt => elt.idLogement)
        if (!empty(ids)) {
            where.idLogement = ids
        }
    }
    
    let occupations = (await db.Occupations.findAll({
        where,
        include: [
            { model: db.Logements, as: 'logement', include: [
                {model: db.SousTypesLogements, as: 'sousTypeLogement'},
            ] },
            { model: db.Locataires, as: 'locataire' },
        ]
    })).map(elt => elt.dataValues)
    
    for (let occupation of occupations) {
        occupation.solde = (await db.Comptes.findOne({where: {typeCompte: 'principal', idOccupation: occupation.idOccupation}, attributes: ['solde']}))?.solde || 0
    }
    
    return res.success(res.translate('liste_des_occupations'), occupations)
}

/**
 * Details d'une occupation
 */
exports.details = async(req, res) => {
    const idOccupation = req.params.idOccupation

    let occupation = await db.Occupations.findByPk(idOccupation, {
        include: [
            { model: db.Logements, as: 'logement', include: [
                {model: db.SousTypesLogements, as: 'sousTypeLogement'},
                {model: db.Batiments, as: 'batiment', include: [
                    {model: db.Cites, as: 'cite'},
                    {model: db.Adresses, as: 'adresse'},
                ]},
                {model: db.Adresses, as: 'adresse'},
            ] },
            { model: db.Locataires, as: 'locataire' },
            { model: db.Comptes, as: 'comptes' },
            { model: db.Charges, as: 'charges', include: [
                { model: db.TypesCharges, as: 'typeCharge' }
            ] },
            { model: db.Loyers, as: 'loyers' },
            { model: db.Indexes, as: 'indexes' },
            { model: db.Contrats, as: 'contrat' },
        ]
    })

    if (empty(occupation)) {
        return res.fail(res.translate('occupation_inexistante'), 404)
    }
    let locataire = occupation.locataire
    occupation = occupation.dataValues
    occupation.locataire = locataire

    occupation.impayerCharges = occupationsService.calcul_impayes(occupation, 'charges')
    occupation.impayerEau = occupationsService.calcul_impayes(occupation, 'eau')
    occupation.impayerEnergie = occupationsService.calcul_impayes(occupation, 'energie')
    occupation.impayerLoyer = occupationsService.calcul_impayes(occupation, 'loyer')
    occupation.impayerTotal = occupation.impayerCharges + occupation.impayerEau + occupation.impayerEnergie + occupation.impayerLoyer 
    occupation.solde = 0
    occupation.depots = []
    for (const compte of occupation.comptes) {
        occupation.solde += compte.solde 
        const depots = (await db.Depots.findAll({ where: {idCompte: compte.idCompte}, order: [['dateDepot', 'DESC']] })).map(elt => elt.dataValues).map(elt => {
            elt.compte = compte.typeCompte
            return elt
        })
        occupation.depots = [...occupation.depots, ...depots]   
    }
    occupation.indexes = occupation.indexes.sort((a, b) => dayjs(b.periode).diff(a.periode))
    occupation.charges = occupation.charges.sort((a, b) => dayjs(b.periode).diff(a.periode))
    occupation.loyers = occupation.loyers.sort((a, b) => dayjs(b.periode).diff(a.periode))

    return res.success(res.translate('details_de_l_occupation'), occupation)
}

/**
 * Cloturer un contrat de bail
 */
 exports.close = async(req, res) => {
    const idOccupation = req.params.idOccupation

    const occupation = await db.Occupations.findByPk(idOccupation)
    const dateFin = req.body.dateFin || new Date()

    if (empty(occupation)) {
        return res.fail(res.translate('occupation_inexistante'), 404)
    }
 
    await db.Occupations.update({dateFin}, { where: { idOccupation }})
    await db.Logements.update({ etatLogement: true }, { where: { idLogement: occupation.idLogement } })

    return res.success(res.translate('bail_cloturer_avec_succes'))
}

/**
 * Edition d'une occupation
 */
 exports.edit = async(req, res) => {
    const idOccupation = req.params.idOccupation

    const loyerBase = req.body.loyer,
        modePaiement = req.body.mode,
        dateDeb = req.body.dateDeb || (req.body.debut || new Date()),
        modeEnergie = req.body.energie,
        modeEau = req.body.eau,
        puEnergie = req.body.puEnergie,
        puEau = req.body.puEau,
        indexEnergie = req.body.indexEnergie, 
        indexEau = req.body.indexEau,
        idLogement = req.body.idLogement,
        idLocataire = req.body.idLocataire,
        avance = parseInt(req.body.avance || 0),
        caution = parseInt(req.body.caution || 0),
        dureeBail = req.body.dureeBail,
        contrat = req.body.contrat

    if (empty(loyerBase) || empty(modePaiement)  || empty(idLogement) || empty(idLocataire)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if ((!empty(modeEau) && !in_array(modeEau, ['index', 'forfait'])) || (!empty(modeEnergie) && !in_array(modeEnergie, ['index', 'forfait']))) {
        return res.fail(res.translate('mode_de_paiement_d_eau_ou_d_energie_invalide'), 403)
    }
    
    const occupation = await db.Occupations.findByPk(idOccupation)
    if (empty(occupation)) {
        return res.fail(res.translate('occupation_inexistante'), 404)
    }

    if (!await db.Locataires.count({ where: { idLocataire } })) {
        return res.fail(res.translate('locataire_inexistant'), 404);
    }
    const logement = await db.Logements.findByPk(idLogement, { include: [{model: db.Indexes, as: 'indexes'}] })
    if (!logement) {
        return res.fail(res.translate('logement_inexistant'), 404)
    }
    if (loyerBase < logement.prixMin || loyerBase > logement.prixMax) {
        return res.fail(res.translate('le_loyer_de_base_doit_etre_entre_les_prix', {
            min: logement.prixMin,
            max: logement.prixMax,
            devise: 'F'
        }), 400)
    }
    try {
        await db.Occupations.update({
            loyerBase: loyerBase || occupation.loyerBase,
            modePaiement: modePaiement || occupation.modePaiement,
            modeEnergie: modeEnergie || occupation.modeEnergie,
            modeEau: modeEau || occupation.modeEau,
            puEnergie: puEnergie || occupation.puEnergie,
            puEau: puEau || occupation.puEau,
            idLogement: idLogement || occupation.idLogement,
            idLocataire: idLocataire || occupation.idLocataire,
            caution: caution || occupation.caution,
            dateDeb: dateDeb || occupation.dateDeb,
            dureeBail: dureeBail || occupation.dureeBail,
        }, { where: {idOccupation}})
  
    /*
        const indexe = logement.indexes.sort((a, b) => {
            return dayjs().diff(b.periode) - dayjs().diff(a.periode)
        })
        
        const lastIndex = {
            eau: indexe.find(elt => elt.typeIndexe == 'eau'),
            energie: indexe.find(elt => elt.typeIndexe == 'energie')
        }
        await db.Indexes.bulkCreate(['eau', 'energie'].map(typeIndexe => {
            let ancien = 0
            if (typeIndexe == 'eau') {
                if (!empty(indexEau) || indexEau === 0) {
                    ancien = indexEau
                }
                else if (lastIndex.eau) {
                    ancien = lastIndex.eau.ancien || 0
                }
            }
            if (typeIndexe == 'energie') {
                if (!empty(indexEnergie) || indexEnergie === 0) {
                    ancien = indexEnergie
                }
                else if (lastIndex.energie) {
                    ancien = lastIndex.energie.ancien || 0
                }
            }
            return {
                typeIndexe,
                idLogement,
                idOccupation: occupation.idOccupation,
                ancien,
                nouveau: ancien,
                periode: dayjs(dateDeb).format('YYYY-MM') + '-01'
            }
        }))
    */

        if (!empty(contrat)) {
            await db.Contrats.update({ contenu: contrat}, { where: {idOccupation: occupation.idOccupation }})
        }

        return res.success(res.translate('occupation_modifier_avec_succes'), occupation)
    } catch (error) {
        console.log(error);
        return res.fail(res.translate('erreur.process'))
    }
}