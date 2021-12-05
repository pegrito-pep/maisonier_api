const bcrypt = require('bcrypt')

const pij = require('php-in-js')
const { empty, in_array } = pij

const db = require('../models')
const synchro = require('../synchro')
const helpers = require('../utils')

const env = require('../config/env')

/**
 * Connexion
 */
exports.signin = async(req, res) => {
    const login = req.body.login,
        mdp = req.body.mdp,
        provider = req.body.provider || 'local'

    if (empty(login) || (provider == 'local' && empty(mdp))) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }

    const user = await db.Utilisateurs.findOne({
        where: {
            [db.Op.or]: [
                { email: login },
                { tel: login }
            ]
        }
    })
    if (empty(user)) {
        return res.fail(res.translate('utilisateur_innexistant'), 404)
    }
    if (provider != user.provider) {
        // return res.fail(res.translate('impossible_de_vous_connecter_via_ce_canal'))
    }
    if (provider == 'local') {
        if (!bcrypt.compareSync(mdp, user.mdp)) {
            return res.fail(res.translate('mot_de_passe_incorrect'), 403)
        }
    }
    if (!user.statutUtilisateur) {
        // return res.fail(res.translate('impossible_de_vous_connecter_car_vous_navez_pas_activer_votre_compte'), 403)
    }

    const role = await db.Roles.findOne({ where: { idUtilisateur: user.idUtilisateur } })
    if (role) {
        user.idEntreprise = role.idEntreprise
    }

    return res.success(res.translate('authentification_reussie'), {
        access_token: helpers.jwt.createToken(user, env.accessTokenExp),
        refresh_token: helpers.jwt.createToken(user, env.refreshTokenExp),
        statutUtilisateur: user.statutUtilisateur
    })
}

/**
 * Inscription 
 */
exports.signup = (req, res) => {
    req.body.sync = 'false'
    return synchro.Auth.signup(req, res)
}

/**
 * Renvoi du code OTP 
 */
exports.resendOTP = async(req, res) => {
    const login = req.body.login,
        type = req.body.type

    if (empty(login) || empty(type)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (!in_array(type, ['otp', 'reset-password'])) {
        return res.fail(res.translate('mauvaise_requete'), 400)
    }

    return await sendOTP(res, login, type)
}

/**
 * Verification du code d'activation
 */
exports.checkOTP = async(req, res) => {
    const login = req.body.login,
        code = req.body.code

    if (empty(login) || empty(code)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }

    let user = helpers.otp.findOne(u => (u.email == login || u.tel == login))

    if (!user) {
        return res.fail(res.translate('impossible_verifier_utilisateur'), 404)
    }
    if (code !== user.code) {
        return res.fail(res.translate('code_activation_incorrect'), 403)
    }

    req.body.sync = 'false'
    req.body.email = login
    req.body.tel = login

    return synchro.Auth.activeAccount(req, res)
}


/**
 * Mot de passe oublié (demande d'un code OTP)  
 */
exports.forgetPassword = async(req, res) => {
    const email = req.body.email

    if (empty(email)) {
        return res.fail(res.translate('donnees_incompetes'), 400)
    }

    return await sendOTP(res, email, 'reset-password')
}

/**
 * Verifie l'otp pour la modification du mot de passe
 */
exports.checkForget = (req, res) => {
    const login = req.body.login,
        code = req.body.code

    if (empty(login) || empty(code)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    let user = helpers.otp.findOne(u => (u.email == login || u.tel == login), 'reset-password')

    if (!user) {
        return res.fail(res.translate('impossible_verifier_utilisateur'), 404)
    }
    if (code !== user.code) {
        return res.fail(res.translate('code_verification_incorrect'), 403)
    }

    return res.success(res.translate('code_verifier'))
}

/**
 * Change le mot de passe 
 */
exports.updatePassword = async(req, res) => {
    const code = req.body.code,
        mdp = req.body.mdp

    if (empty(mdp) || empty(code)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }

    const user = helpers.otp.findOne(u => (u.code == code), 'reset-password')

    if (!user) {
        return res.fail(res.translate('impossible_verifier_utilisateur'), 404)
    }

    if (bcrypt.compareSync(mdp, user.mdp)) {
        return res.fail(res.translate('vous_ne_pouvez_pas_entrer_le_meme_mdp'), 403)
    }

    req.body.tel = user.tel
    req.body.email = user.email
    req.body.sync = 'false'

    return await synchro.Auth.updatePassword(req, res)
}


/**
 * Demande de nouveau token 
 */
exports.refreshToken = async(req, res) => {
    const token = req.body.token

    if (empty(token)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }

    const { idUtilisateur } = helpers.jwt.decode(token)
    if (empty(idUtilisateur)) {
        return res.fail(res.translate('token_invalide_ou_expirer'), 498)
    }

    const user = await db.Utilisateurs.findByPk(u.idUtilisateur)
    if (empty(user)) {
        return res.fail(res.translate('token_corrompu'), 404)
    }

    return res.success(res.translate('token_rafraichi'), {
        access_token: helpers.jwt.createToken(user, env.accessTokenExp),
        refresh_token: helpers.jwt.createToken(user, env.refreshTokenExp),
        statutUtilisateur: user.statutUtilisateur
    })
}




/**
 * Envoi du code otp 
 * 
 * @Visibility private
 * 
 * @param {*} res 
 * @param {*} email 
 * @param {*} type 
 * @returns 
 */
const sendOTP = async(res, login, type) => {
    const user = await db.Utilisateurs.findOne({
        where: {
            [db.Op.or]: [
                { email: login },
                { tel: login }
            ]
        }
    })
    if (empty(user)) {
        return res.fail(res.translate('utilisateur_innexistant'), 404)
    }

    let otp = helpers.otp.findOne(u => (u.email == user.email || u.tel == user.tel), type)
    if (empty(otp)) {
        otp = {
            tel: user.tel,
            email: user.email,
            mdp: user.mdp,
            code: helpers.utils.generateKey()
        }
        helpers.otp.saveSync(otp, type)
    }

    helpers.mailer().to(user.email).subject(type == 'opt' ? 'Code de verification' : 'Réinitialisation du mot de passe').send(type, { code: otp.code })

    return res.success(res.translate('code_envoyer'))
}