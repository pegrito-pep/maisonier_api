const helpers = require('../utils')

/**
 * Verifie l'existance et la validite du token
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.checkToken = async(req, res, next) => {
    const payload = helpers.jwt.decode(req.headers['authorization'])
    res.response = helpers.response(res)

    if (!payload) {
        return res.fail(res.translate('token_invalide_ou_expirer'), 498)
    }

    const { Utilisateurs } = require('../models')
    const user = await Utilisateurs.findOne({ where: { idUtilisateur: payload.idUtilisateur } })
    if (!user) {
        return res.fail(res.translate('token_corrompu'), 498)
    }
    req.user = Object.assign({}, user.dataValues, { idEntreprise: payload.idEntreprise })

    next()
}

/**
 * Internationalisation 
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.translator = (req, res, next) => {
    /**
     * @param {*} key 
     * @param {*} options 
     */
    res.translate = (key, options) => {
        return helpers.translator(req.locale.language).translate(key, options)
    }

    next()
}

/**
 * Gestion des reponses json  
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.responder = (req, res, next) => {
    const response = helpers.response(res)

    res.fail = (message, code, errors) => {
        return response.fail(message, code, errors)
    }

    res.success = (message, result, code) => {
        return response.success(message, result, code)
    }

    res.go = (data, status) => {
        return response.send(data, status)
    }

    next()
}