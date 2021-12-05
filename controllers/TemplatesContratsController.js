const pij = require('php-in-js')
const { empty } = pij

const db = require('../models')

/**
 * Ajout d'un nouveau template de contrat
 */
exports.create = async(req, res) => {
    const titreTemplate = req.body.titre,
        contenu = req.body.contenu
        
    if (empty(titreTemplate) || empty(contenu)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }

    if (await db.TemplatesContrats.count({ where: { titreTemplate } })) {
        return res.fail(res.translate('un_template_de_contrat_ayant_ce_titre_existe_deja'), 409)
    }
    
    try {
        const template = await db.TemplatesContrats.create({ titreTemplate, contenu })
        
        return res.success(res.translate('template_de_contrat_creer_avec_succes'), template, 201)
    } catch (error) {
        console.log(error);
        return res.fail(res.translate('erreur.process'))
    }
}

/**
 * Liste des templates de contrats
 */
exports.list = async(req, res) => {
    const idTemplate = req.params.idTemplate
    let where = {}
    if (!empty(idTemplate)) {
        where.idTemplate = idTemplate
    }
    let templates = await db.TemplatesContrats.findAll({ where })

    if (!empty(idTemplate)) {
        if (empty(templates)) {
            return res.fail(res.translate('template_de_contrat_inexistant'), 404)
        }
        templates = templates.shift()
    }

    return res.success(res.translate('templates_de_contrat'), templates)
}

/**
 * Edition des informations d'un template de contrat
 */
 exports.edit = async(req, res) => {
    const titreTemplate = req.body.titre,
        contenu = req.body.contenu,
        idTemplate = req.params.idTemplate

    const template = await db.TemplatesContrats.findByPk(idTemplate)

    if (empty(template)) {
        return res.fail(res.translate('template_de_contrat_inexistante'), 404)
    }
    await db.TemplatesContrats.update({
        titreTemplate: titreTemplate || template.titreTemplate,
        contenu: contenu || template.contenu
    }, { where: { idTemplate } })

    return res.success(res.translate('template_de_contrat_modifier_avec_succes'))
}

/**
 * Suppression d'un template de contrat
 */
exports.remove = async(req, res) => {
    const idTemplate = req.params.idTemplate

    await db.TemplatesContrats.destroy({ where: { idTemplate } })

    return res.success(res.translate('suppression_effectuer_avec_succes'))
}