const pij = require('php-in-js')
const { empty, uniqid } = pij

const base64Img = require('base64-img')
const md5 = require('md5')

const db = require('../models')
const env = require('../config/env')
const helpers = require('../utils')


/**
 * Modification de l'avatar de l'utilisateur
 */
exports.setAvatar = async(req, res) => {
    let avatar = req.body.photo
    const photo = req.body.avatar,
        idUtilisateur = req.body.idUtilisateur
    sync = req.body.sync

    if (empty(avatar) && empty(photo)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }

    try {
        if (empty(avatar)) {
            const filepath = base64Img.imgSync(photo, __dirname + '/../static/avatars', md5(uniqid())),
                pathArr = filepath.split(/(\/|\\)/g)
            avatar = `${env.baseUrl}/static/avatars/${pathArr[pathArr.length - 1]}`
        }

        await db.Utilisateurs.update({ avatar }, { where: { idUtilisateur } })

        if (sync && sync === 'false') {
            helpers.api.patch('synchro/set-avatar', { avatar: photo, photo: avatar, idUtilisateur })
        }

        return res.success(res.translate('avatar_modifier_avec_succes'))
    } catch (err) {
        console.log('erreur', err)
        return res.fail(res.translate('erreur.process'))
    }
}