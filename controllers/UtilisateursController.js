const validator = require('validator')

const db = require('../models')
const { jwt } = require('../utils')

/**
 * Recupere la liste des utilisateurs
 */
exports.list = async(req, res) => {
    try {
        const users = await db.Utilisateurs.findAll()

        return res.success(res.translate('liste_des_utilisateurs'), users)
    } catch (err) {
        console.log('erreur', err)
        return res.fail(res.translate('erreur.process'))
    }
}

/**
 * Recupere les informations d'un utilisateur
 */
exports.single = async(req, res) => {
    let idUtilisateur = req.params.id,
        where = {}

    if (validator.isUUID(idUtilisateur)) {
        where.idUtilisateur = idUtilisateur
    } else if (/^[0-9]{4}-[A-Z]{1}[0-9]{1}-[0-9]{6}$/.test(idUtilisateur)) {
        where.code = idUtilisateur
    } else {
        const u = jwt.decode(idUtilisateur)
        if (!u) {
            return res.fail(res.translate('token_invalide_ou_expirer'), 498)
        }
        where.idUtilisateur = u.idUtilisateur
    }

    try {
        const user = await db.Utilisateurs.findOne({
            where,
            attributes: { exclude: ['mdp'] },
            include: [
                { model: db.Profils, as: 'profil' },
                { model: db.Preferences, as: 'preferences' },
                { model: db.Entreprises }
            ]
        })

        if (!user) {
            return res.fail(res.translate('utilisateur_innexistant'), 404)
        }
        return res.success(res.translate('informations_de_l_utilisateur'), user)
    } catch (err) {
        console.log('erreur', err)
        return res.fail(res.translate('erreur.process'))
    }
}