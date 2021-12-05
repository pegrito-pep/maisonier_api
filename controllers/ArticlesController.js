const pij = require('php-in-js')
const { empty, is_array } = pij

const db = require('../models')

/**
 * Ajout d'un nouvel article de contrat
 */
exports.add = async(req, res) => {
    const numArticle = req.body.numero,
        titreArticle = req.body.titre,
        rubriques = req.body.rubriques || []

    if (empty(numArticle) || empty(titreArticle)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }

    if (await db.Articles.count({
            where: {
                idUtilisateur: req.user.idUtilisateur,
                [db.Op.or]: [{ numArticle }, { titreArticle }]
            }
        })) {
        return res.fail(res.translate('un_article_avec_ce_numero_ou_ce_titre_existe_deja'), 409)
    }

    const article = await db.Articles.create({
        numArticle,
        titreArticle,
        idUtilisateur: req.user.idUtilisateur
    })

    if (is_array(rubriques) && !empty(rubriques)) {
        await db.Rubriques.bulkCreate(rubriques.map(el => {
            return {
                descRubrique: el.description,
                valeur: el.valeur == 'true' || el.valeur == true,
                idArticle: article.idArticle
            }
        }))
    }

    return res.success(res.translate('article_ajouter_avec_succes'), article, 201)
}

/**
 * Liste de tous les articles
 */
exports.list = async(req, res) => {
    const articles = await db.Articles.findAll({
        where: { statutArticle: !(req.query.restorable === 'true'), idUtilisateur: req.user.idUtilisateur },
        order: [
            ['numArticle']
        ],
        include: [{ model: db.Rubriques, as: 'rubriques' }]
    })

    return res.success(res.translate('liste_des_articles'), articles)
}

/**
 * Edition des informations d'un article
 */
exports.edit = async(req, res) => {
    const numArticle = req.body.numero,
        titreArticle = req.body.titre,
        idArticle = req.params.idArticle

    const article = await db.Articles.findByPk(idArticle)

    if (empty(article)) {
        return res.fail(res.translate('article_inexistant'), 404)
    }
    if (article.idUtilisateur != req.user.idUtilisateur) {
        return res.fail(res.translate('vous_n_avez_pas_acces_a_cette_ressource'), 403)
    }

    await db.Articles.update({ numArticle: article.numArticle }, { where: { numArticle, idUtilisateur: article.idUtilisateur } })

    await db.Articles.update({
        numArticle: numArticle || article.numArticle,
        titreArticle: titreArticle || article.titreArticle
    }, { where: { idArticle } })

    return res.success(res.translate('article_modifier_avec_succes'))
}

/**
 * Suppression d'un article
 */
exports.remove = async(req, res) => {
    const force = req.query.force === 'true',
        idArticle = req.params.idArticle

    if (force) {
        return exports.destroy(req, res)
    }
    const where = {
        idArticle: !empty(idArticle) ? idArticle : (await db.Articles.findAll({ where: { idUtilisateur: req.user.idUtilisateur } })).map(elt => elt.idArticle)
    }
    await db.Articles.update({ statutArticle: false }, { where })

    return res.success(res.translate('article_supprimer_avec_succes'))
}
exports.destroy = async(req, res) => {
    const idArticle = req.params.idArticle

    const where = {
            idArticle: !empty(idArticle) ? idArticle : (await db.Articles.findAll({ where: { idUtilisateur: req.user.idUtilisateur } })).map(elt => elt.idArticle)
        },
        datas = await db.Articles.findAll({ where, attributes: ['idArticle', 'titreArticle'] })

    let supprimables = [],
        nonSupprimables = []
    const tables = [db.Rubriques],
        articles = datas.map(element => element.dataValues)

    for (let j = 0, count = articles.length; j < count; j++) {
        let exist = false,
            article = articles[j]

        for (let i = 0, size = tables.length; i < size; i++) {
            exist = await tables[i].count({ where: { idArticle: article.idArticle } })
            if (exist) {
                break
            }
        }

        if (exist) {
            nonSupprimables.push(article.titreArticle)
        } else {
            supprimables.push(article.idArticle)
        }
    }

    supprimables.forEach(async idArticle => {
        await db.Articles.destroy({ where: { idArticle } })
    })
    if (nonSupprimables.length) {
        return res.fail(res.translate('impossible_de_supprimer_les_articles', { articles: `" ${(nonSupprimables).join(', ')} "` }), 405)
    }
    return res.success(res.translate('suppression_effectuer_avec_succes'))
}

/**
 * Restaurer un article 
 */
exports.restore = async(req, res) => {
    const idArticle = req.params.idArticle

    const where = {
        idArticle: !empty(idArticle) ? idArticle : (await db.Articles.findAll({ where: { idUtilisateur: req.user.idUtilisateur } })).map(elt => elt.idArticle)
    }
    await db.Articles.update({ statutArticle: true }, { where })

    return res.success(res.translate('article_restaurer_avec_succes'))
}

/**
 * Genere les articles et rubriques par defaut pour un utilisateur 
 */
exports.generate = async(req, res) => {
    const articles = require(__dirname + '/../data/articles.json')
    const rubriques = require(__dirname + '/../data/rubriques.json')

    for (let i = 0, size = articles.length; i < size; i++) {
        const titreArticle = articles[i].libelle,
            numArticle = articles[i].numero

        const exist = await db.Articles.count({ where: { idUtilisateur: req.user.idUtilisateur, titreArticle } })
        if (!exist) {
            const article = await db.Articles.create({
                titreArticle,
                numArticle,
                idUtilisateur: req.user.idUtilisateur
            })
            db.Rubriques.bulkCreate(
                rubriques.filter(elt => elt.article_bail == articles[i].id).map(elt => {
                    return {
                        descRubrique: elt.libelle,
                        valeur: elt.valeur === 'True',
                        idArticle: article.idArticle
                    }
                })
            )
        }
    }

    return res.success(res.translate('articles_generer_avec_succes'))
}