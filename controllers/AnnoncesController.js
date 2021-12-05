const pij = require('php-in-js')
const { empty, explode, in_array, is_string, strlen } = pij

require('../utils/prototypes')

const db = require('../models')
const helpers = require('../utils')

/**
 * Ajout d'une nouvelle annonce
 */
exports.add = async(req, res) => {
    const titreAnnonce = req.body.titre,
        descAnnonce = req.body.description,
        tags = req.body.tags,
        idLogement = req.body.idLogement || req.params.idLogement || '',
        publish = in_array(req.body.publish, [true, 'true'])

    let duree = req.body.duree || new Date(),
        dateDeb = new Date(),
        dateFin = null;

    if (empty(titreAnnonce) || empty(descAnnonce) || empty(idLogement) || (true !== publish && empty(duree))) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (strlen(titreAnnonce) < 20) {
        return res.fail(`${res.translate('titre_annonce_invalide')}. ${res.translate('veuillez_entrer_au_moins_n_caracteres', {nbr: 20})}`, 400)
    }
    if (strlen(descAnnonce) < 200) {
        return res.fail(`${res.translate('description_annonce_invalide')}. ${res.translate('veuillez_entrer_au_moins_n_caracteres', {nbr: 200})}`, 400)
    }

    if (!empty(duree)) {
        if (is_string(duree) && duree.includes(",")) {
            duree = duree.split(',').map(elt => elt.trim())
            if (!empty(duree[0])) {
                dateDeb = duree[0]
            }
            if (!empty(duree[1])) {
                dateFin = duree[1]
            }
        } else {
            dateFin = dateDeb.addDays(duree)
        }
    }

    try {
        if (!await db.Logements.count({ where: { idLogement, idUtilisateur: req.user.idUtilisateur } })) {
            return res.fail(res.translate('le_logement_entrer_n_existe_pas'), 400)
        }
        if (await db.Annonces.count({ where: { idLogement, etatAnnonce: false, publish: true } })) {
            return res.fail(res.translate('ce_logement_possede_deja_une_annonce_active'), 409)
        }

        const annonce = await db.Annonces.create({
            idLogement,
            titreAnnonce,
            descAnnonce,
            publish,
            tags: tags instanceof Array ? tags.join(', ') : tags,
            dateDeb,
            dateFin,
            etatAnnonce: true
        });
        const logement = await db.Logements.findOne({
            where: { idLogement },
            include: [
                { model: db.Photos, as: 'photos' },
                { attributes: { exclude: ['idLogement'] }, model: db.CaracteristiquesLogements, as: 'caracteristiques' },
                { attributes: { exclude: ['idLogement'] }, model: db.Adresses, as: 'adresse' }
            ]
        })

        if (publish) {
           /*  helpers.api.post('synchro/annonces', {
                titre: titreAnnonce,
                description: descAnnonce,
                tags: tags,
                prix: logement.prixMax,
                idCategorie: logement.idSousType,
                adresse: logement.adresse.dataValues,
                images: logement.Photos.map(photo => photo.image),
                caracteristiques: logement.caracteristiques.map(c => {
                    return { libelle: c.libelleCaracteristique, valeur: c.valeur }
                }),
                idAnnonce: annonce.idAnnonce,
                idLogement: logement.idLogement,
                idUtilisateur: logement.idUtilisateur
            }) */
        }

        return res.success(res.translate('annonce_creer_avec_success'), annonce, 201)
    } catch (err) {
        console.log('error', err);
        return res.fail(res.translate('erreur.process'))
    }
}

/**
 * Liste de tous les annonces d'un logement
 */
exports.list = async(req, res) => {
    const idLogement = req.params.idLogement,
        idOccupation = req.params.idOccupation,
        filter = explode('-', req.query.filter || ''),
        my = in_array(req.query.my, [true, 'true'])
    
    let withDate = req.query.withDate || true,
        payload = helpers.jwt.decode(req.headers['authorization'])

    let where_in = [],
        where = {etatAnnonce: true},
        idUtilisateur = req.query.idUtilisateur || (req.params.idUtilisateur || null),
        ids = []

    if (empty(idUtilisateur) && !empty(payload)) {
        idUtilisateur = payload.idUtilisateur || null
    }
    if (my) {
        if (empty(idUtilisateur)) {
            return res.fail('Non autorisé', 403)
        }
        ids = (await db.Logements.findAll({ attributes: ['idLogement'], where: { idUtilisateur } })).map(logement => logement.idLogement)

    } else if (false != withDate && 'false' != withDate) {
        const day = new Date();
        where = Object.assign({}, where, {
            [db.Op.and]: {
                dateDeb: { [db.Op.lte]: day },
                [db.Op.or]: {
                    dateFin: { [db.Op.gte]: day },
                    dateFin: { [db.Op.is]: null },
                }
            }
        })
    }

    if (in_array('publish', filter)) {
        where.publish = true
    }
    if (in_array('unpublish', filter)) {
        where.publish = false
    }
    if (in_array('all', filter)) {
        // where.etatAnnonce = true
    } else {
        if (in_array('disabled', filter)) {
            where.etatAnnonce = false
        }
    }

    if (!empty(idOccupation)) {
        ids = (await db.Occupations.findAll({ attributes: ['idLogement'], where: { idOccupation } })).map(logement => logement.idLogement)
    }

    if (!empty(ids)) {
        where_in.push(...ids)
    }

    if (!empty(idLogement)) {
        where.idLogement = idLogement
    } else if (!empty(where_in)) {
        where.idLogement = {
            [db.Op.in]: where_in
        }
    }

    const annonces = (await db.Annonces.findAll({
        where,
        include: [{
            model: db.Logements,
            as: 'logement',
            include: [
                { model: db.Adresses, as: 'adresse' },
                { model: db.Batiments, as: 'batiment', include: [{ model: db.Adresses, as: 'adresse'}]},
            ]
        }]
    })).map(annonce => annonce.dataValues)

    for (let i = 0, size = annonces.length; i < size; i++) {
        annonces[i].nbrPropostions = await db.Propositions.count({ where: { idAnnonce: annonces[i].idAnnonce } })
        annonces[i].photos = (await db.Photos.findAll({ where: { idLogement: annonces[i].idLogement } })).map(elt => elt.image)
        annonces[i].utilisateur = await db.Utilisateurs.findByPk(annonces[i].logement.idUtilisateur)
    }

    return res.success(res.translate('liste_des_annonces'), annonces)
}
exports.all = async(req, res) => {
    db.Annonces.findAll().then(annonces => {
        return res.success(res.translate('liste_des_annonces'), annonces)
    })
}

/**
 * Edition des informations d'une annonce
 */
exports.edit = async(req, res) => {
    const titreAnnonce = req.body.titre,
        descAnnonce = req.body.description,
        tags = req.body.tags,
        idLogement = req.body.idLogement,
        idAnnonce = req.params.idAnnonce

    let duree = req.body.duree,
        dateDeb = new Date(),
        dateFin = null;

    if (!empty(titreAnnonce) && strlen(titreAnnonce) < 20) {
        return res.fail(`${res.translate('titre_annonce_invalide')}. ${res.translate('veuillez_entrer_au_moins_n_caracteres', {nbr: 20})}`, 400)
    }
    if (!empty(descAnnonce) && strlen(descAnnonce) < 200) {
        return res.fail(`${res.translate('description_annonce_invalide')}. ${res.translate('veuillez_entrer_au_moins_n_caracteres', {nbr: 200})}`, 400)
    }

    try {
        if (!empty(idLogement) && !await db.Logements.count({ where: { idLogement, idUtilisateur: req.user.idUtilisateur } })) {
            return res.fail(res.translate('le_logement_entrer_n_existe_pas'), 400)
        }

        const annonce = await db.Annonces.findByPk(idAnnonce)
        if (empty(annonce)) {
            return res.fail(res.translate('annonce_innexistante'), 404)
        }

        if (!empty(duree)) {
            if (is_string(duree) && duree.includes(",")) {
                duree = duree.split(',')

                dateDeb = duree[0].trim()
                dateFin = duree[1].trim()
            } else {
                if (req.query.refresh !== true) {
                    dateDeb = new Date(annonce.dateDeb)
                }
                dateFin = dateDeb.addDays(duree)
            }
        }

        await db.Annonces.update({
            titreAnnonce: titreAnnonce || annonce.titreAnnonce,
            descAnnonce: descAnnonce || annonce.descAnnonce,
            idLogement: idLogement || annonce.idLogement,
            tags: tags ? (tags instanceof Array ? tags.join(', ') : tags) : annonce.tags,
            dateDeb: dateDeb || annonce.dateDeb,
            dateFin: dateFin || annonce.dateFin,
        }, { where: { idAnnonce } })

        return res.success(res.translate('annonce_modifier_avec_succes'))
    } catch (err) {
        console.log('erreur', err)
        return res.fail(res.translate('erreur.process'))
    }
}

/**
 * Suppression d'une annonce
 */
exports.remove = async(req, res) => {
    const force = req.query.force === 'true',
        idAnnonce = req.params.idAnnonce,
        idLogement = req.params.idLogement

    if (!idAnnonce && !idLogement) {
        return res.success(res.translate('aucune_action_a_effectuer'), null, 100)
    }

    if (force) {
        await db.Annonces.destroy({ where: idAnnonce ? { idAnnonce } : { idLogement } })
    } else {
        await db.Annonces.update({ etatAnnonce: false }, { where: idAnnonce ? { idAnnonce } : { idLogement } })
    }

    return res.success(res.translate(force ? 'suppression_effectuer_avec_succes' : 'desactivation_effectuer_avec_succes'))
}


/**
 * Liste des propositions d'une annonce
 */
exports.listPropositions = async(req, res) => {
    const idAnnonce = req.params.idAnnonce,
        idUtilisateur = req.params.idUtilisateur || req.query.idUtilisateur

    let where = {}

    if (!empty(idAnnonce)) {
        where.idAnnonce = idAnnonce
    }
    if (!empty(idUtilisateur)) {
        where.idUtilisateur = idUtilisateur
    }

    try {
        const propositions = await db.Propositions.findAll({
            where,
            include: [
                { model: db.Utilisateurs },
                { model: db.Annonces },
            ]
        })
        return res.success(res.translate('liste_des_propositions_d_annonces'), propositions)
    } catch (err) {
        console.log('erreur', err);
        return res.fail(res.translate('erreur.process'))
    }
}

/**
 * Ajoute une proposition a une annonce
 */
exports.addProposition = async(req, res) => {
    const idAnnonce = req.params.idAnnonce,
        proposition = req.body.proposition

    if (empty(proposition)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }

    try {
        if (!await db.Annonces.count({ where: { idAnnonce } })) {
            return res.fail(res.translate('annonce_innexistante'), 404)
        }
        const proposition = await db.Propositions.create({
            idAnnonce,
            proposition,
            idUtilisateur: req.user.idUtilisateur
        })
        return res.success(res.translate('proposition_enregistrer_avec_succes'), proposition, 201)
    } catch (err) {
        console.log('erreur', err)
        return res.fail(res.translate('erreur.process'))
    }
}

/**
 * Publier une annonce
 */
exports.publish = async(req, res) => {
    idAnnonce = req.params.idAnnonce

    if (!await db.Annonces.count({ where: { idAnnonce } })) {
        return res.fail(res.translate('annonce_innexistante'), 404)
    }

    await db.Annonces.update({ publish: true }, { where: { idAnnonce } })

    return res.success(res.translate('annonce_publier'))
}

/**
 * Depublier une annonce
 */
exports.unpublish = async(req, res) => {
    idAnnonce = req.params.idAnnonce

    if (!await db.Annonces.count({ where: { idAnnonce } })) {
        return res.fail(res.translate('annonce_innexistante'), 404)
    }

    await db.Annonces.update({ publish: false }, { where: { idAnnonce } })

    return res.success(res.translate('annonce_depublier'))
}

/**
 * Liste des annonces pour la partie sociale
 */
 exports.listSociale = async(req, res) => {
    let withDate = req.query.withDate || true,
        where = {etatAnnonce: true, publish: true}

    if (false != withDate && 'false' != withDate) {
        const day = new Date();
        where = Object.assign({}, where, {
            [db.Op.and]: {
                dateDeb: { [db.Op.lte]: day },
                [db.Op.or]: {
                    dateFin: { [db.Op.gte]: day },
                    dateFin: { [db.Op.is]: null },
                }
            }
        })
    }

    const annonces = (await db.Annonces.findAll({
        where,
        include: [{
            model: db.Logements,
            as: 'logement',
            attributes: ['idSousType', 'idUtilisateur', 'prixMin', 'prixMax']
        }]
    })).map(annonce => annonce.dataValues)

    for (let i = 0, size = annonces.length; i < size; i++) {
        annonces[i].photos = (await db.Photos.findAll({ limit: 1, where: { idLogement: annonces[i].idLogement } })).map(elt => elt.image)
        annonces[i].caracteristiques = (await db.CaracteristiquesLogements.findAll({ attributes: ['libelleCaracteristique', 'valeur'], where: { idLogement: annonces[i].idLogement } }))
        annonces[i].adresse = (await db.Adresses.findOne({ where: { 
            [db.Op.or]: {
                idLogement: annonces[i].idLogement,
                idBatiment: (await db.Logements.findByPk(annonces[i].idLogement, {attributes: ['idBatiment']}))?.idBatiment || null
            }
        } }))
        annonces[i].utilisateur = await db.Utilisateurs.findByPk(annonces[i].logement.idUtilisateur, {attributes: ['nom', 'prenom']})
        annonces[i].type = await db.SousTypesLogements.findByPk(annonces[i].logement.idSousType, {attributes: ['libelleSousType']})
    }

    return res.success(res.translate('liste_des_annonces'), annonces)
}

/**
 * Details d'une annonce pour la partie sociale
 */
exports.detailsSociale = async(req, res) => {
    const idAnnonce = req.params.idAnnonce

    let annonce = await db.Annonces.findByPk(idAnnonce, {
        include: [
            {
                model: db.Logements,
                as: 'logement',
                attributes: ['idSousType', 'idUtilisateur', 'prixMin', 'prixMax']
            },
            {
                model: db.Propositions,
                as: 'propositions'
            }
        ]
    })
    if (empty(annonce)) {
        return res.fail(res.translate('annonce_inexistante'), 404)
    }
    annonce = annonce.dataValues

    annonce.photos = (await db.Photos.findAll({ where: { idLogement: annonce.idLogement } })).map(elt => elt.image)
    annonce.caracteristiques = (await db.CaracteristiquesLogements.findAll({ attributes: ['libelleCaracteristique', 'valeur'], where: { idLogement: annonce.idLogement } }))
    annonce.adresse = (await db.Adresses.findOne({ where: { 
        [db.Op.or]: {
            idLogement: annonce.idLogement,
            idBatiment: (await db.Logements.findByPk(annonce.idLogement, {attributes: ['idBatiment']}))?.idBatiment || null
        }
    } }))
    annonce.utilisateur = await db.Utilisateurs.findByPk(annonce.logement.idUtilisateur, {attributes: ['nom', 'prenom']})
    annonce.type = await db.SousTypesLogements.findByPk(annonce.logement.idSousType, {attributes: ['libelleSousType']})
    

    return res.success(res.translate('liste_des_annonces'), annonce)
}