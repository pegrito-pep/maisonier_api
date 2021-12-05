const md5 = require('md5')
const pij = require('php-in-js')
const { empty } = pij

const db = require('../models')
const { uploadImage, removeImage } = require('../utils/utils')

/**
 * Ajout d'une nouvelle batiment
 */
exports.add = async(req, res) => {
    const nomBatiment = req.body.nom,
        refBatiment = req.body.ref,
        idCite = req.body.idCite || req.params.idCite,
        batiments = req.body.batiments || [],
        adresse = req.body.adresse || {}
    
    let photo = req.body.photo
        
    if (empty(idCite)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (empty(batiments) && (empty(nomBatiment) || empty(refBatiment))) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (!adresse.pays || !adresse.ville || !adresse.quartier) {
        return res.fail(res.translate('adresse_incomplete'), 400)
    }
    if (!await db.Cites.count({ where: { idCite } })) {
        return res.fail(res.translate('cite_inexistante'), 404)
    }
    try {
        let createdBatiments = null;
        if (empty(batiments)) {
            if (await db.Batiments.count({ where: { idCite, nomBatiment } })) {
                return res.fail(res.translate('cette_cite_a_deja_un_batiment_ayant_ce_nom'), 409)
            }
            let data = { nomBatiment, refBatiment, idCite, image:'' }

            if (!empty(photo)) {
                data.image = uploadImage(photo, 'batiments', md5(pij.uniqid()))
            }
            createdBatiments = await db.Batiments.create(data)
            try {
                await db.Adresses.create({ idBatiment: createdBatiments.idBatiment, ...adresse })    
            } catch (error) {
                let addr = await db.Adresses.findOne({order: [['idAdresse', 'DESC']], attributes: ['idAdresse']}), idAdresse = 1
                if (!empty(addr)) {
                    idAdresse = addr.idAdresse + 1
                }
                await db.Adresses.create({ idBatiment: createdBatiments.idBatiment, ...adresse, idAdresse })   
            }
        }
        else {
            createdBatiments = []
            for (let i = 0; i < batiments.length; i++) {
                let {nom, ref, photo} = batiments[i];
                if (!empty(nom) && !empty(ref)) {
                    const batiment = await db.Batiments.findOne({ where: { idCite, nomBatiment: nom } })
                    if (!empty(batiment)) {
                        await db.Batiments.update({statutBatiment: true}, {where: {idBatiment: batiment.idBatiment}})
                        createdBatiments.push(batiment.dataValues)
                    }
                    else {
                        let data = { nomBatiment: nom, refBatiment: ref, idCite, image: ''}
                        if (!empty(photo)) {
                            data.image = uploadImage(photo, 'batiments', md5(pij.uniqid()))
                        }
                        createdBatiments.push( (await db.Batiments.create(data)).dataValues )
                    }
                }   
            }
        }
        
        return res.success(res.translate('batiment_ajouter_avec_succes'), createdBatiments, 201)
    } catch (err) {
        console.log('erreur', err)
        return res.fail(res.translate('erreur.process'))
    }
}

/**
 * Liste de tous les Batiments d'un utilisateur
 */
exports.list = async(req, res) => {
    const idCite = req.params.idCite
    let where = {
        idCite: idCite || (await db.Cites.findAll({ attributes: ['idCite'], where: { idUtilisateur: req.user.idUtilisateur } })).map(cite => cite.idCite),
        statutBatiment: !(req.query.restorable === 'true'),
    }
    const batiments = (await db.Batiments.findAll({ 
        where, 
        include: [
            { model: db.Cites, as: 'cite' }, 
            { model: db.Adresses, as: 'adresse' }
        ]})).map(elt => { return {...elt.dataValues, image: elt.image}})

    for (let i = 0; i < batiments.length; i++) {
        batiments[i].logements = await db.Logements.findAll({
            where: { idBatiment: batiments[i].idBatiment, statutLogement: true },
            include: [
                { model: db.Photos, as: 'photos', attributes: ['image', 'idLogement'] },
                { model: db.CaracteristiquesLogements, as: 'caracteristiques' },
                { model: db.Depenses, as: 'depenses' },
                { model: db.Adresses, as: 'adresse' },
                { model: db.SousTypesLogements, as: 'sousTypeLogement', include: [
                    {model: db.TypesLogements, as: 'typeLogement'}
                ] },
            ]
        })
        batiments[i].depenses = await db.Depenses.findAll({where: {idBatiment: batiments[i].idBatiment}})
    }
    
    return res.success(res.translate('liste_des_batiments_de_l_utilisateur'), batiments)
}

/**
 * Edition des informations d'une nouvelle cite
 */
exports.edit = async(req, res) => {
    const nomBatiment = req.body.nom,
        refBatiment = req.body.ref,
        idCite = req.body.idCite,
        photo = req.body.photo,
        idBatiment = req.params.idBatiment,
        adresse = req.body.adresse || {}

    try {
        const batiment = await db.Batiments.findByPk(idBatiment, { attributes: ['nomBatiment', 'refBatiment', 'idCite', 'image'] })

        if (empty(batiment)) {
            return res.fail(res.translate('batiment_inexistant'), 404)
        }
        if (!empty(idCite) && !await db.Cites.count({ where: { idCite } })) {
            return res.fail(res.translate('cite_inexistante'), 404)
        }

        let data = {
            nomBatiment: nomBatiment || batiment.nomBatiment,
            refBatiment: refBatiment || batiment.refBatiment,
            idCite: idCite || batiment.idCite,
            image: batiment.image
        }
        if (!empty(photo) && photo != batiment.image) {
            const url = uploadImage(photo, 'batiments', md5(pij.uniqid()))
            if (!empty(url)) {
                if (!empty(batiment.image)) {
                    removeImage(batiment.image.split('static/')[1])
                }
                data.image = url
            }
        }
        await db.Batiments.update(data, { where: { idBatiment } })
        if (!empty(adresse)) {
            const addr = await db.Adresses.findOne({where: { idBatiment }})
            await db.Adresses.update({
                pays: adresse.pays || addr.pays,
                ville: adresse.ville || addr.ville,
                quartier: adresse.quartier || addr.quartier,
                lon: adresse.lon || addr.lon,
                lat: adresse.lat || addr.lat,
            }, { where: { idBatiment } })
        }

        return res.success(res.translate('batiment_modifier_avec_succes'))
    } catch (err) {
        console.log('erreur', err)
        return res.fail(res.translate('erreur.process'))
    }
}

/**
 * Suppression d'un batiment
 */
exports.remove = async(req, res) => {
    const force = req.query.force === 'true',
        idBatiment = req.params.idBatiment,
        idCite = req.params.idCite

    if (force) {
        return exports.destroy(req, res)
    }

    let where = {}
    if (!empty(idBatiment)) {
        where.idBatiment = idBatiment
    } else {
        where.idCite = idCite || (await db.Cites.findAll({ attributes: ['idCite'], where: { idUtilisateur: req.user.idUtilisateur } })).map(cite => cite.idCite)
    }

    await db.Batiments.update({ statutBatiment: false }, { where })

    return res.success(res.translate('batiment_supprimer_avec_succes'))
}
exports.destroy = async(req, res) => {
    const idBatiment = req.params.idBatiment,
        idCite = req.params.idCite

    let where = {}
    if (!empty(idBatiment)) {
        where.idBatiment = idBatiment
    } else {
        where.idCite = idCite || (await db.Cites.findAll({ attributes: ['idCite'], where: { idUtilisateur: req.user.idUtilisateur } })).map(cite => cite.idCite)
    }

    const datas = await db.Batiments.findAll({ where, attributes: ['idBatiment', 'nomBatiment'] })

    let supprimables = [],
        nonSupprimables = []
    const tables = [db.Logements],
        batiments = datas.map(element => element.dataValues)

    for (let j = 0, count = batiments.length; j < count; j++) {
        let exist = false,
            batiment = batiments[j]

        for (let i = 0, size = tables.length; i < size; i++) {
            exist = await tables[i].count({ where: { idBatiment: batiment.idBatiment } })
            if (exist) {
                break
            }
        }

        if (exist) {
            nonSupprimables.push(batiment.nomBatiment)
        } else {
            supprimables.push(batiment.idBatiment)
        }
    }

    supprimables.forEach(async idBatiment => {
        await db.Batiments.destroy({ where: { idBatiment } })
    })
    if (nonSupprimables.length) {
        return res.fail(res.translate('impossible_de_supprimer_les_batiments', { batiments: `" ${(nonSupprimables).join(', ')} "` }), 405)
    }
    return res.success(res.translate('suppression_effectuer_avec_succes'))
}

/**
 * Restauration de batiments
 */
exports.restore = async(req, res) => {
    let idBatiment = req.params.idBatiment,
        idCite = req.params.idCite

    if (empty(idBatiment) && empty(idCite)) {
        idCite = (await db.Cites.findAll({ where: { idUtilisateur: req.user.idUtilisateur }, attributes: ['idCite'] })).map(cite => cite.idCite)
    }
    if (!idBatiment && !idCite) {
        return res.success(res.translate('aucune_action_a_effectuer'), null, 100)
    }
    await db.Batiments.update({ statutBatiment: true }, { where: idBatiment ? { idBatiment } : { idCite } })

    return res.success(res.translate('restauration_effectuer_avec_succes'))
}