const { hashSync } = require("bcrypt")
const md5 = require("md5")
const { empty, uniqid } = require("php-in-js")
const db = require("../models")
const { uploadImage, removeImage } = require("../utils/utils")

const synchro = require(__dirname + '/../synchro')
const day = require('../utils/day')

/**
 * Modification de l'avatar de l'utilisateur
 */
exports.setAvatar = async(req, res) => {
    req.body.idUtilisateur = req.user.idUtilisateur
    req.body.sync = 'false'

    return await synchro.Account.setAvatar(req, res)
}

/**
 * Modification des informations du profil de l'utilisateur
 */
exports.updateProfil = async(req, res) => {
    const { nom, prenom, email, tel, mdp, avatar, dateNaiss } = req.body
    const user = req.user

    let data = {
        nom: nom || user.nom,
        prenom: prenom || user.prenom,
        email: user.email,
        tel: user.tel,
        mdp: user.mdp,
        avatar: user.avatar,
        dateNaiss: user.dateNaiss
    }
    if (!empty(mdp)) {
        data.mdp = hashSync(mdp, 5)
    }
    if (!empty(avatar) && avatar != user.avatar) {
        const url = uploadImage(avatar, 'avatars', md5(uniqid()))
        if (!empty(url)) {
            if (!empty(user.avatar)) {
                removeImage(user.avatar.split('static/')[1])
            }
            data.avatar = url
        }
    }
    if (!empty(tel) && tel != user.tel) {
        if (await db.Utilisateurs.count({where: {tel, idUtilisateur: {[db.Op.ne]: user.idUtilisateur} }})) {
            return res.fail(res.translate('un_utilisateur_avec_ce_tel_existe_deja'), 409)
        }
        data.tel = tel
    }
    if (!empty(email) && email != user.email) {
        if (await db.Utilisateurs.count({where: {email, idUtilisateur: {[db.Op.ne]: user.idUtilisateur} }})) {
            return res.fail(res.translate('un_utilisateur_avec_ce_mail_existe_deja'), 409)
        }
        data.email = email
    }
    if (!empty(dateNaiss)) {
        data.dateNaiss = day().fromFormat(dateNaiss, ["DD-MM-YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD")
    }

    await db.Utilisateurs.update(data, {where: {idUtilisateur: user.idUtilisateur }})

    return res.success('Modifications effectuée', data)
}

/**
 * Modification des preferences de l'utilisateur
 */
exports.updatePreferences = async(req, res) => {
    const {langue, devise, puEnergie, puEau} = req.body
    let data = {
        langue: langue || 'en',
        devise: devise || 'F',
        puEnergie, puEau
    }
    const preference = await db.Preferences.findByPk(req.user.idUtilisateur)
    if (!empty(preference)) {
        data = {
            langue: langue || preference.langue,
            devise: devise || preference.devise,
            puEnergie: puEnergie || preference.puEnergie,
            puEau: puEau || preference.puEau
        }
        await db.Preferences.update(data, { where: {idUtilisateur: req.user.idUtilisateur }})
    }
    else {
        await db.Preferences.create({...data, idUtilisateur: req.user.idUtilisateur})
    }
 
    return res.success('Modifications effectuée', data)
}