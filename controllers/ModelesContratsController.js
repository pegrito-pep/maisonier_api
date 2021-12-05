const pij = require('php-in-js')
const { empty, is_array } = pij

const db = require('../models')
const bailleurRepo = require('../repositories/BailleurRepo')

/**
 * Ajout d'un nouveau modele de contrat
 */
exports.create = async(req, res) => {
    const libelleModele = req.body.libelle,
        idTemplate = req.body.idTemplate || req.params.idTemplate || null,
        contenu = req.body.contenu,
        idLogement = req.body.idLogement,
        idBatiment = req.body.idBatiment,
        idCite = req.body.idCite

    if (empty(libelleModele) || empty(contenu)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }

    if (await db.ModelesContrats.count({ where: { libelleModele, idUtilisateur: req.user.idUtilisateur } })) {
        return res.fail(res.translate('vous_avez_deja_un_modele_de_contrat_ayant_ce_libelle'), 409)
    }
    if (!empty(idTemplate) && ! await db.TemplatesContrats.count({ where: {idTemplate} })) {
        return res.fail(res.translate('template_de_contrat_inexistant'), 404)
    }
    
    try {
        const modele = await db.ModelesContrats.create({ libelleModele, idTemplate, contenu, idUtilisateur: req.user.idUtilisateur })
        if (!empty(idLogement)) {
            await db.Logements.update({ idModele: modele.idModele }, { where: { idLogement } })
        }
        if (!empty(idBatiment)) {
            await db.Logements.update({ idModele: modele.idModele }, { where: { idBatiment } })
        }
        
        return res.success(res.translate('modele_de_contrat_creer_avec_succes'), modele, 201)
    } catch (error) {
        console.log(error);
        return res.fail(res.translate('erreur.process'))
    }
}

/**
 * Liste des modeles de contrats
 */
exports.list = async(req, res) => {
    const idModele = req.params.idModele,
        idLogement = req.params.idLogement

    let where = {}
    if (!empty(idModele)) {
        where.idModele = idModele
    } 
    else if (!empty(idLogement)) {
        const logement = await db.Logements.findByPk(idLogement, {attributes: ['idModele']})
        if (empty(logement)) {
            return res.fail(res.translate('logement_inexistant'), 404)
        }
        where.idModele = logement.idModele
    }
    else {
        where.idUtilisateur = req.user.idUtilisateur
    }

    let modeles = await db.ModelesContrats.findAll({
        where,
        include: [
            { model: db.Logements, as: 'logements' },
            { model: db.Utilisateurs, as: 'utilisateur' },
            { model: db.TemplatesContrats, as: 'templateContrat' }
        ]
    })

    if (!empty(idModele)) {
        if (empty(modeles)) {
            return res.fail(res.translate('modele_de_contrat_inexistant'), 404)
        }
        modeles = modeles.shift()
    }
    else if (!empty(idLogement) && !empty(modeles)) {
        modeles = modeles.shift()
    }

    return res.success(res.translate('modeles_de_contrat'), modeles)
}

/**
 * Associe un modele de contrat a un logement
 */
exports.associate = async(req, res) => {
    const idModele = req.params.idModele

    let logements = req.body.logements || [],
        {idLogement, idBatiment, idCite} = req.body,
        my = pij.in_array(req.query.my, ['true', true])

    if (!is_array(logements)) {
        return res.fail(res.translate('mauvaise_requete'), 400)
    }
    if (! await db.ModelesContrats.count({where: {idModele}})) {
        return res.fail(res.translate('modele_de_contrat_inexistant'), 404)
    }

    if (!empty(idLogement)) {
        logements = pij.array_merge(logements, [idLogement])
    }
    if (!empty(idBatiment)) {
        logements = pij.array_merge(logements, (await db.Logements.findAll({attributes: ['idLogement'], where: {idBatiment}})).map(elt => elt.idLogement))
    }
    if (!empty(idCite)) {
        logements = pij.array_merge(logements, (await db.Logements.findAll({attributes: ['idLogement'], where: {
            idBatiment: (await db.Batiments.findAll({attributes: ['idBatiment'], where: {idCite}})).map(elt => elt.idBatiment)
        }})).map(elt => elt.idLogement))
    }

    if (empty(logements) && my) {
        logements = (await bailleurRepo.logements(req.user.idUtilisateur)).map(elt => elt.idLogement)
    }

    logements.forEach(async(id) => {
        await db.Logements.update({idModele}, {where: {idLogement: id}})
    });

    return res.success(res.translate('association_effectuer_avec_succes'))
}