const pij = require('php-in-js')
const { empty, strlen, uniqid } = pij

const md5 = require('md5')
const validator = require('validator')

const db = require('../models')
const { uploadImage } = require('../utils/utils')
const { calcul_impayes } = require('../services/OccupationsService')


/**
 * Ajout d'un nouveau locataire
 */
exports.create = async(req, res) => {
    const nomLocataire = req.body.nom,
        prenomLocataire = req.body.prenom,
        cniLocataire = req.body.cni,
        tel = req.body.tel,
        tel2 = req.body.tel2,
        tel3 = req.body.tel3,
        tel4 = req.body.tel4,
        email = req.body.email,
        email2 = req.body.email2,
        avatar = req.body.avatar,
        titre = req.body.titre,
        profession = req.body.profession,
        dateNaiss = req.body.dateNaiss || null,
        lieuNaiss = req.body.lieuNaiss,
        code = req.body.code

    if (empty(nomLocataire) || empty(tel)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (!empty(email) && !validator.isEmail(email)) {
        return res.fail(res.translate('email_invalide'), 400)
    }
    if (!empty(email2) && !validator.isEmail(email2)) {
        return res.fail(res.translate('email_invalide'), 400)
    }

    let locataire, data = {
        nomLocataire,
        prenomLocataire,
        cniLocataire,
        tel,
        tel2,
        tel3,
        tel4,
        email,
        email2,
        profession,
        titre,
        dateNaiss,
        lieuNaiss,
        avatar: '',
        idUtilisateur: null,
        idBailleur: req.user.idUtilisateur
    }

    if (!empty(code)) {
        const user = await db.Utilisateurs.findOne({ where: { code } })
        if (!empty(user)) {
            data.idUtilisateur = user.idUtilisateur
        }
    }
    if (!empty(avatar)) {
        data.avatar = uploadImage(avatar, 'avatars', md5(uniqid()))
    }

    let create = true
    if (!empty(data.idUtilisateur)) {
        locataire = await db.Locataires.findOne({ where: { idUtilisateur: data.idUtilisateur, idBailleur: data.idBailleur } })
        if (!empty(locataire)) {
            await db.Locataires.update(data, { where: { idLocataire: locataire.idLocataire } })

            locataire = Object.assign({}, locataire.dataValues, data)
            create = false
        }
    }
    if (create) {
        locataire = await db.Locataires.create(data)
    }

    return res.success(res.translate('locataire_ajouter_avec_succes'), locataire, 201)
}

/**
 * Liste des locataires d'un bailleur
 */
exports.list = async(req, res) => {
    const locataires = (await db.Locataires.findAll({
        where: { idBailleur: req.user.idUtilisateur },
        include: [
            { model: db.Utilisateurs, as: 'habitant' },
            { model: db.Occupations, as: 'occupations', include: [
                { model: db.Logements, as: 'logement', attributes: ['idUtilisateur', 'refLogement'] },
                { model: db.Charges, as: 'charges' },
                { model: db.Loyers, as: 'loyers' },
                { model: db.Indexes, as: 'indexes' },
            ]}
        ]
    })).map(elt => {return {...elt.dataValues, avatar: elt.avatar}})

    for (let i = 0; i < locataires.length; i++) {
        locataires[i].impayerCharges = 0
        locataires[i].impayerEau = 0
        locataires[i].impayerEnergie = 0
        locataires[i].impayerLoyer = 0
        locataires[i].impayerTotal = 0
        locataires[i].solde = 0
        
        const occupations = locataires[i].occupations.map(elt => elt.dataValues)
        locataires[i].occupations = []

        for (let j = 0; j < occupations.length; j++) {
            const occupation = occupations[j];
            if (occupation.logement.idUtilisateur != req.user.idUtilisateur) {
                continue
            }
            
            occupation.impayerCharges = calcul_impayes(occupation, 'charges')
            occupation.impayerEau = calcul_impayes(occupation, 'eau')
            occupation.impayerEnergie = calcul_impayes(occupation, 'energie')
            occupation.impayerLoyer = calcul_impayes(occupation, 'loyer')
            occupation.impayerTotal = occupation.impayerCharges + occupation.impayerEau + occupation.impayerEnergie + occupation.impayerLoyer 
    
            delete occupation.charges 
            delete occupation.indexes
            delete occupation.loyers
    
            occupation.solde = (await db.Comptes.findOne({where: {typeCompte: 'principal', idOccupation: occupation.idOccupation}, attributes: ['solde']}))?.solde || 0
            
            locataires[i].occupations.push(occupation)
        }

        locataires[i].impayerCharges = locataires[i].occupations.reduce((accumulator, current) => accumulator + current.impayerCharges, 0)
        locataires[i].impayerEau = locataires[i].occupations.reduce((accumulator, current) => accumulator + current.impayerEau, 0)
        locataires[i].impayerEnergie = locataires[i].occupations.reduce((accumulator, current) => accumulator + current.impayerEnergie, 0)
        locataires[i].impayerLoyer = locataires[i].occupations.reduce((accumulator, current) => accumulator + current.impayerLoyer, 0)
        locataires[i].impayerTotal = locataires[i].impayerLoyer + locataires[i].impayerEnergie + locataires[i].impayerEau + locataires[i].impayerCharges
        locataires[i].solde = locataires[i].occupations.reduce((accumulator, current) => accumulator + current.solde, 0)
    }

    return res.success(res.translate('liste_des_habitants'), locataires)
}

/**
 * Liste des logements occupés par un locataires 
 */
exports.logements = async(req, res) => {
    const idLocataire = req.params.idLocataire

    const logements = (await db.Occupations.findAll({
        where: { idLocataire },
        include: [{ model: db.Logements, as: 'logement' }]
    })).map(elt => elt.dataValues.logement)

    return res.success(res.translate('logements_du_locataire'), logements)
}

/**
 * Liste des insolvables
 */
exports.insolvables = async(req, res) => {
    const insolvables = [],
        locataires = (await db.Locataires.findAll({
            where: {idBailleur: req.user.idUtilisateur},
            include: [
                { model: db.Occupations, as: 'occupations', include: [
                    {model: db.Loyers, as: 'loyers'},
                    {model: db.Indexes, as: 'indexes'},
                    {model: db.Charges, as: 'charges'},
                    {model: db.Logements, as: 'logement'}
                ]}
            ]
        })).map(elt => elt.dataValues)

    for (const locataire of locataires) {
        let impayerTotal = 0, impayerLoyer = 0, impayerEau = 0, impayerEnergie = 0, impayerCharges = 0, habitant = locataire 
        
        for (const occupation of locataire.occupations) {
            if (occupation.logement.idUtilisateur != req.user.idUtilisateur) {
                continue
            }
            impayerLoyer += calcul_impayes(occupation, 'loyer') 
            impayerCharges += calcul_impayes(occupation, 'charges')
            impayerEau += calcul_impayes(occupation, 'eau')
            impayerEnergie += calcul_impayes(occupation, 'energie') 
            impayerTotal += (impayerLoyer + impayerEnergie + impayerEau + impayerCharges)
        }
        delete habitant.occupations
        
        if (impayerTotal > 0) {
            insolvables.push({
                habitant,
                impayerTotal, 
                impayerLoyer,
                impayerEnergie,
                impayerEau,
                impayerCharges
            })
        }
    }

    return res.success('Liste des insolvables', insolvables)

}
