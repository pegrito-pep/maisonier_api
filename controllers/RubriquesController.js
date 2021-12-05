const pij = require('php-in-js')
const { empty, in_array } = pij

const db = require('../models')

/**
 * Ajout d'un nouvelle rubrique
 */
exports.add = async(req, res) => {
    const valeur = req.body.valeur,
        descRubrique = req.body.description,
        idArticle = req.params.idArticle || req.body.idArticle,
        rubriques = req.body.rubriques || []

    if (empty(idArticle)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (empty(rubriques) && empty(descRubrique)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (!await db.Articles.count({ where: { idArticle } })) {
        return res.fail(res.translate('l_article_selectioner_n_existe_pas'), 404)
    }
    try {
        let createdRubriques = null;
        if (empty(rubriques)) {
            if (await db.Rubriques.count({ where: { descRubrique, idArticle } })) {
                return res.fail(res.translate('la_rubrique_existe_deja'), 409)
            }
            createdRubriques = await db.Rubriques.create({
                descRubrique,
                idArticle,
                valeur: in_array(valeur, [true, 'true', 1, '1'])
            })
        }
        else {
            createdRubriques = []
            for (let i = 0; i < rubriques.length; i++) {
                let {description, valeur} = rubriques[i];
                if (!empty(description) && !await db.Rubriques.count({ where: { idArticle, descRubrique: description } })) {
                    createdRubriques.push( (await db.Rubriques.create({ idArticle, descRubrique: description, valeur: in_array(valeur, [true, 'true', 1, '1']) })).dataValues )
                }   
            }
        }
        
        return res.success(res.translate('rubrique_ajouter_avec_success'), createdRubriques, 201)
    } catch (err) {
        console.log('erreur', err)
        return res.fail(res.translate('erreur.process'))
    }
}

/**
 * Liste de toutes les rubriques
 */
exports.list = async(req, res) => {
    const idArticle = req.params.idArticle || null
    let options = {
        where: { statutRubrique: !(req.query.restorable === 'true') }
    }
    if (idArticle) {
        options.where.idArticle = idArticle
    } else {
        options.where.idArticle = (await db.Articles.findAll({ where: { idUtilisateur: req.user.idUtilisateur }, attributes: ['idArticle'] })).map(elt => elt.idArticle)
        options.include = [{
            model: db.Articles, as: 'article'
        }]
    }

    const rubriques = await db.Rubriques.findAll(options)

    return res.success(res.translate('liste_des_rubriques'), rubriques)
}

/**
 * Edition des informations d'une rubrique
 */
exports.edit = async(req, res) => {
    const valeur = req.body.valeur,
        descRubrique = req.body.description,
        idArticle = req.body.idArticle,
        idRubrique = req.params.idRubrique

    const rubrique = await db.Rubriques.findByPk(idRubrique)

    if (empty(rubrique)) {
        return res.fail(res.translate('rubrique_inexistante'), 404)
    }
    if (!empty(idArticle) && !await db.Articles.count({ where: { idArticle } })) {
        return res.fail(res.translate('l_article_selectioner_n_existe_pas'), 404)
    }
    await db.Rubriques.update({
        descRubrique: descRubrique || rubrique.descRubrique,
        idArticle: idArticle || rubrique.idArticle,
        valeur: in_array(valeur || rubrique.valeur, [true, 'true', 1, '1'])
    }, { where: { idRubrique } })

    return res.success(res.translate('rubrique_modifier_avec_succes'))
}

/**
 * Suppression d'une rubrique
 */
exports.remove = async(req, res) => {
    const force = req.query.force === 'true',
        idArticle = req.params.idArticle,
        idRubrique = req.params.idRubrique

    if (force) {
        return exports.destroy(req, res)
    }

    if (!idRubrique && !idArticle) {
        return res.success(res.translate('aucune_action_a_effectuer'), null, 100)
    }
    await db.Rubriques.update({ statutRubrique: false }, { where: idRubrique ? { idRubrique } : { idArticle } })

    return res.success(res.translate('suppression_effectuer_avec_succes'))
}
exports.destroy = async(req, res) => {
    const idRubrique = req.params.idRubrique,
        idArticle = req.params.idArticle

    if (!idRubrique && !idArticle) {
        return res.success(res.translate('aucune_action_a_effectuer'), null, 100)
    }
    const datas = await db.Rubriques.findAll({ where: idRubrique ? { idRubrique } : { idArticle }, attributes: ['idRubrique'] })

    let supprimables = [],
        nonSupprimables = []
    const tables = [db.RubriquesContrats, db.RubriquesModelesContrats],
        rubriques = datas.map(element => element.dataValues)

    for (let j = 0, count = rubriques.length; j < count; j++) {
        let exist = false,
            rubrique = rubriques[j]

        for (let i = 0, size = tables.length; i < size; i++) {
            exist = await tables[i].count({ where: { idRubrique: rubrique.idRubrique } })
            if (exist) {
                break
            }
        }

        if (exist) {
            nonSupprimables.push(rubrique.idRubrique)
        } else {
            supprimables.push(rubrique.idRubrique)
        }
    }

    supprimables.forEach(async idRubrique => {
        await db.Rubriques.destroy({ where: { idRubrique } })
    })
    if (nonSupprimables.length) {
        return res.fail(res.translate('impossible_de_supprimer_les_rubriques', { rubriques: `" ${(nonSupprimables).join(', ')} "` }), 405)
    }

    return res.success(res.translate('suppression_effectuer_avec_succes'))
}

/**
 * Restaurer une rubrique
 */
exports.restore = async(req, res) => {
    const idArticle = req.params.idArticle,
        idRubrique = req.params.idRubrique

    if (!idRubrique && !idArticle) {
        return res.success(res.translate('aucune_action_a_effectuer'), null, 100)
    }
    await db.Rubriques.update({ statutRubrique: true }, { where: idRubrique ? { idRubrique } : { idArticle } })

    return res.success(res.translate('restauration_effectuer_avec_succes'))
}