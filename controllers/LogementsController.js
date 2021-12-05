const dayjs = require('dayjs');
const pij = require('php-in-js')
const { empty, strlen, uniqid } = pij

const fs = require('fs');
const md5 = require('md5')

const db = require('../models')
const env = require('../config/env');
const { generateRefLogement, uploadImage } = require('../utils/utils');
const bailleurRepo = require('../repositories/BailleurRepo')


/**
 * Ajout d'un nouveau logement
 */
exports.add = async(req, res) => {
    const refLogement = req.body.ref,
        descLogement = req.body.description,
        prixMin = parseInt(req.body.prixMin || ''),
        prixMax = parseInt(req.body.prixMax || ''),
        idSousType = req.body.idSousType,
        idBatiment = req.body.idBatiment || null,
        idModele = req.body.idModele || null,
        idEntreprise = req.body.idEntreprise || req.user.idEntreprise || null,
        adresse = req.body.adresse || {},
        caracteristiques = req.body.caracteristiques || [],
        photos = req.body.photos || []

    if (empty(refLogement) || empty(idSousType) || !prixMin || !prixMax) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (prixMin > prixMax || prixMin < 0) {
        return res.fail(res.translate('prix_incorrect'), 422)
    }
    /*if (!photos || !(photos instanceof Array) || !photos.length) {
        return helpers.response(res).fail('Specifiez au moins une photo de votre logement', 400)
    }*/

    if (!await db.SousTypesLogements.count({ where: { idSousType } })) {
        return res.fail(res.translate('type_de_logement_inexistant'), 400)
    }
    if (!empty(idBatiment)) {
        if (!await db.Batiments.count({ where: { idBatiment } })) {
            return res.fail(res.translate('batiment_inexistant'), 400)
        }
        if (await db.Logements.count({where: {refLogement, idBatiment}})) {
            return res.fail(res.translate('un_logement_avec_cette_reference_existe_deja'), 409)
        }
    }
    else if (!adresse.pays || !adresse.ville || !adresse.quartier) {
        return res.fail(res.translate('adresse_incomplete'), 400)
    }
    else {
        const logementsBailleurs = (await bailleurRepo.logements(req.user.idUtilisateur)).map(elt => elt.refLogement)
        if (pij.in_array(refLogement, logementsBailleurs)) {
            return res.fail(res.translate('un_logement_avec_cette_reference_existe_deja'), 409)
        }
    }

    let data = {
        refLogement,
        descLogement,
        prixMax,
        prixMin,
        idSousType,
        idBatiment,
        idModele
    }
    if (!empty(idEntreprise)) {
        data.idEntreprise = idEntreprise
    } else {
        data.idUtilisateur = req.user.idUtilisateur
    }

    // On cree le logement
    const logement = await db.Logements.create(data)
        // On join l'adresse
    if (empty(idBatiment)) {
        try {
            await db.Adresses.create({ idLogement: logement.idLogement, ...adresse })
        } catch (error) {
            let addr = await db.Adresses.findOne({order: [['idAdresse', 'DESC']], attributes: ['idAdresse']}), idAdresse = 1
            if (!empty(addr)) {
                idAdresse = addr.idAdresse + 1
            }
            await db.Adresses.create({ idLogement: logement.idLogement, ...adresse, idAdresse })   
        }      
    }
        // On insert les photos
    let images = []
    photos.forEach(image => {
        images.push(uploadImage(image, 'logements', md5(uniqid())))
    })

    await db.Photos.bulkCreate(images.map(image => {
        return {
            image,
            idLogement: logement.idLogement
        }
    }))

        // On insere les caracteristiques
    if (caracteristiques.length) {
        await db.CaracteristiquesLogements.bulkCreate(
            caracteristiques.map(caracteristique => {
                return {
                    libelleCaracteristique: caracteristique.libelle,
                    valeur: caracteristique.valeur,
                    idLogement: logement.idLogement,
                }
            })
        )
    }
    // On initialise les indexes
    await db.Indexes.bulkCreate(['eau', 'energie'].map(typeIndexe => ({
        typeIndexe,
        idLogement: logement.idLogement,
        ancien: 0,
        nouveau: 0,
        periode: dayjs().format('YYYY-MM') + '-01'
    })))

    return res.success('Logement ajouté avec succès', logement, 201)
}

/**
 * Liste de tous les Logements d'un utilisateur
 */
exports.list = async(req, res) => {
    const idBatiment = req.params.idBatiment,
        idCite = req.params.idCite,
        idEntreprise = req.params.idEntreprise || req.user.idEntreprise

    let where = {
        statutLogement: true,
    }
    if (!empty(idCite)) {
        where.idBatiment = {
            [db.Op.in]: (await db.Batiments.findAll({ where: { idCite } })).map(batiments => batiments.idBatiment)
        }
    }
    else if (!empty(idBatiment)) {
        where.idBatiment = idBatiment
    }
    else if (!empty(idEntreprise)) {
        where.idEntreprise = idEntreprise
    }
    else {
        where.idUtilisateur = req.user.idUtilisateur 
    }

    const logements = (await db.Logements.findAll({
        include: [
            { model: db.Annonces, as: 'annonces' },
            { model: db.Batiments, as: 'batiment', include: [{ model: db.Adresses, as: 'adresse' }]},
            { model: db.Photos, as: 'photos', attributes: ['image', 'idLogement'] }, 
            { model: db.CaracteristiquesLogements, as: 'caracteristiques' },
            { model: db.Depenses, as: 'depenses' },
            { model: db.Adresses, as: 'adresse' },
            { model: db.Indexes, as: 'indexes' },
            { model: db.SousTypesLogements, as: 'sousTypeLogement', include: [
                {model: db.TypesLogements, as: 'typeLogement'}
            ] },
            {model: db.Occupations, as: 'occupations', include: [
                {model: db.Locataires, as: 'locataire'}
            ]}
        ],
        where
    })).map(elt => elt.dataValues).map(elt => {
        const indexe = elt.indexes.sort((a, b) => {
            return dayjs().diff(a.periode) - dayjs().diff(b.periode)
        })
        
        elt.lastIndexEau = indexe.find(elt => elt.typeIndexe == 'eau')
        elt.lastIndexEnergie = indexe.find(elt => elt.typeIndexe == 'energie')

        return elt
    })

    return res.success('Liste des logements', logements)
}

/**
 * Clonnage de logement
 */
exports.clone = async(req, res) => {
    const {nbr, idBatiment} = req.body 
    const idLogement = req.params.idLogement

    if (empty(nbr)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (nbr > 10) {
        return res.fail(res.translate('impossible_de_generer_plus_de_nbr_clone_simultanement', {nbr: 10}), 402)
    }

    const logement = await db.Logements.findByPk(idLogement, {
        include: [
            { model: db.Photos, as: 'photos', attributes: ['image', 'idLogement'] },
            { model: db.CaracteristiquesLogements, as: 'caracteristiques' },
            { model: db.Adresses, as: 'adresse' },
            { model: db.Depenses, as: 'depenses' },
        ]
    })
    if (empty(logement)) {
        return res.fail(res.translate('logement_inexistant'), 404)
    }

    let clone, data = {
        idBatiment,
        descLogement: logement.descLogement,
        prixMax: logement.prixMax,
        prixMin: logement.prixMin,
        idSousType: logement.idSousType,
        idModele: logement.idModele,
        idEntreprise: logement.idEntreprise,
        idUtilisateur: logement.idUtilisateur
    };

    const nbRef = await db.Logements.count({ where: { refLogement: {[db.Op.startsWith]: logement.refLogement + '-'} } })
    for (let i = (nbRef + 1); i <= (nbRef + nbr); i++) {
        clone = await db.Logements.create({refLogement: logement.refLogement + '-' + i, ...data})
        await db.CaracteristiquesLogements.bulkCreate(
            logement.caracteristiques.map(caracteristique => {
                return {
                    libelleCaracteristique: caracteristique.libelleCaracteristique,
                    valeur: caracteristique.valeur,
                    idLogement: clone.idLogement,
                }
            })
        )
        logement.photos.forEach(photo => {
            if (!empty(photo.image)) {
                let path = photo.image.split('logements/')[1], name = md5(uniqid()) + '.' + path.split('.')[1]
                fs.copyFile(`${__dirname}/../static/logements/${path}`, `${__dirname}/../static/logements/${name}`, async(err) => {
                    if (!err) {
                        await db.Photos.create({
                            image: `${env.baseUrl}/static/logements/${name}`,
                            idLogement: clone.idLogement
                        })
                    }
                });
            }
        })
        logement.depenses.forEach(async(depense) => {
            let photo = ''
            if (!empty(depense.photo)) {
                let path = depense.photo.split('depenses/')[1], name = md5(uniqid()) + '.' + path.split('.')[1]
                fs.copyFileSync(`${__dirname}/../static/depenses/${path}`, `${__dirname}/../static/depenses/${name}`);
                photo = `${env.baseUrl}/static/depenses/${name}`
            }
            await db.Depenses.create({...depense, photo, idLogement: clone.idLogement})
        })
        await db.Adresses.create({...logement.adresse.dataValues, idLogement: clone.idLogement})
    }

    return res.success('Logement clonné avec succès')
}

/**
 * Edition d'un nouveau logement
 */
 exports.edit = async(req, res) => {
    const idLogement = req.params.idLogement
    
    const refLogement = req.body.ref,
        descLogement = req.body.description,
        prixMin = parseInt(req.body.prixMin || ''),
        prixMax = parseInt(req.body.prixMax || ''),
        idSousType = req.body.idSousType,
        idBatiment = req.body.idBatiment || null,
        idModele = req.body.idModele || null,
        adresse = req.body.adresse || {},
        caracteristiques = req.body.caracteristiques || []
        // photos = req.body.photos || []

    if (empty(refLogement) || empty(idSousType) || !prixMin || !prixMax) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (prixMin > prixMax || prixMin < 0) {
        return res.fail(res.translate('prix_incorrect'), 422)
    }
    
    const logement = await db.Logements.findByPk(idLogement)
    if (empty(logement)) {
        return res.fail(res.translate('logement_inexistant'), 404)
    }
    if (!await db.SousTypesLogements.count({ where: { idSousType } })) {
        return res.fail(res.translate('type_de_logement_inexistant'), 400)
    }
    if (!empty(idBatiment)) {
        if (!await db.Batiments.count({ where: { idBatiment } })) {
            return res.fail(res.translate('batiment_inexistant'), 400)
        }
        if (await db.Logements.count({where: {refLogement, idBatiment, idLogement: {[db.Op.ne]: idLogement}} })) {
            return res.fail(res.translate('un_logement_avec_cette_reference_existe_deja'), 409)
        }
    }
    else {
        const logementsBailleurs = (await bailleurRepo.logements(req.user.idUtilisateur)).filter(elt => elt.idLogement != idLogement).map(elt => elt.refLogement)
        if (pij.in_array(refLogement, logementsBailleurs)) {
            return res.fail(res.translate('un_logement_avec_cette_reference_existe_deja'), 409)
        }
    }

    let data = {
        refLogement: refLogement || logement.refLogement,
        descLogement: descLogement || logement.descLogement,
        prixMax: prixMax || logement.prixMax,
        prixMin: prixMin || logement.prixMin,
        idSousType: idSousType || logement.idSousType,
        idBatiment: idBatiment || logement.idBatiment,
        idModele: idModele || logement.idModele,
    }

    // On modifie le logement
    await db.Logements.update(data, {where: {idLogement}})
      
    // On join l'adresse
    if (!empty(adresse)) {
        await db.Adresses.update(adresse, {where: {idLogement}})
    }
        
    /*
    // On insert les photos
    let images = []
    photos.forEach(image => {
        images.push(uploadImage(image, 'logements', md5(uniqid())))
    })

    await db.Photos.bulkCreate(images.map(image => {
        return {
            image,
            idLogement: logement.idLogement
        }
    }))*/

    // On insere les caracteristiques
    if (caracteristiques.length) {
        await db.CaracteristiquesLogements.destroy({where: { idLogement }})

        await db.CaracteristiquesLogements.bulkCreate(caracteristiques.map(caracteristique => {
            return {
                libelleCaracteristique: caracteristique.libelle,
                valeur: caracteristique.valeur,
                idLogement,
            }})
        )
    }
    
    return res.success('Logement modifié avec succès', {...logement.dataValues, ...data}, 201)
}

/**
 * Suppression (desactivation) de logement
 */
exports.delete = async(req, res) => {
    const idLogement = req.params.idLogement

    await db.Logements.update({statutLogement: false}, {where: {idLogement}})

    return res.success(res.translate('logement_supprimer_avec_succes'))
}