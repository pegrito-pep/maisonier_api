const pij = require('php-in-js')
const { array_rand, empty, date, range, uniqid } = pij

const bcrypt = require('bcrypt')
const base64Img = require('base64-img')
const md5 = require('md5')
const validator = require('validator')

const db = require(__dirname + '/../models')
const env = require(__dirname + '/../config/env')
const helpers = require(__dirname + '/../utils')


/**
 * Inscription 
 */
exports.signup = async(req, res) => {
    const sync = req.body.sync
    const idUtilisateur = req.body.idUtilisateur
    let avatar = req.body.photo || '',
        otp = req.body.otp || null,
        userCode = req.body.userCode || null

    const provider = req.body.provider || 'local'

    const nom = req.body.nom,
        prenom = req.body.prenom,
        email = req.body.email,
        tel = req.body.tel,
        mdp = req.body.mdp,
        photo = req.body.avatar || '',
        dateNaiss = req.body.dateNaiss || null

    const raisonSociale = req.body.raisonSociale,
        registreCommerce = req.body.registreCommerce,
        siegeSocial = req.body.siegeSocial || '',
        emailEntreprise = req.body.emailEntreprise || '',
        dateCreation = req.body.dateCreation || '',
        logo = req.body.logo || ''

    let genre = (req.body.genre ? req.body.genre[0] : '').toLowerCase()

    if (empty(nom) || empty(prenom) || empty(email)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (empty(provider) || provider == 'local' && (empty(tel) || empty(mdp)/*  || empty(genre) */)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (!validator.isEmail(email)) {
        return res.fail(res.translate('email_invalide'), 400)
    }
    if (genre === 'h') {
        genre = 'm'
    }
    if (genre === 'e') {
        if (raisonSociale == '' || registreCommerce == '' || siegeSocial == '' || emailEntreprise == '' || dateCreation == '') {
            return res.fail(res.translate('donnees_entreprise_incompletes'), 400)
        }
        if (!validator.isEmail(emailEntreprise)) {
            return res.fail(res.translate('email_entreprise_invalide'), 400)
        }
    }
    if (await db.Utilisateurs.count({ where: { email } }) || await db.Profils.count({ where: { email2: email } })) {
        return res.fail(res.translate('un_utilisateur_avec_ce_mail_existe_deja'), 409)
    }
    if (await db.Utilisateurs.count({ where: { tel } }) || await db.Profils.count({
            where: {
                [db.Op.or]: { tel2: tel, tel3: tel, tel4: tel }
            }
        })) {
        return res.fail(res.translate('un_utilisateur_avec_ce_tel_existe_deja'), 409)
    }

    if (genre === 'e') {
        if (await db.Entreprises.count({ where: { registreCommerce } })) {
            return res.fail(res.translate('une_entreprise_avec_ce_registre_existe_deja'), 409)
        }
    }

    if (!empty(photo) && empty(avatar)) {
        const filepath = base64Img.imgSync(photo, __dirname + '/../static/avatars', md5(uniqid())),
            pathArr = filepath.split(/(\/|\\)/g)
        avatar = `${env.baseUrl}/static/avatars/${pathArr[pathArr.length - 1]}`
    }
    if (empty(userCode)) {
        const lettres = range('A', 'Z')
        do {
            const key = array_rand(lettres)
            userCode = date('ym') + '-' + lettres[key] + helpers.utils.generateKey(1) + '-' + helpers.utils.generateKey(6)
        }
        while (await db.Utilisateurs.count({ where: { code: userCode } }))
    }

    try {
        let data = {
            nom,
            prenom,
            email,
            tel,
            genre,
            avatar,
            provider,
            dateNaiss,
            mdp: empty(mdp) ? '' : bcrypt.hashSync(mdp, 5),
            code: userCode
        }
        if (!empty(idUtilisateur)) {
            data.idUtilisateur = idUtilisateur
        }
        const user = await db.Utilisateurs.create(data)

        let profil = { idUtilisateur: user.idUtilisateur, titre: 'Mr' }
        if (genre == 'f') {
            profil.titre = 'Mme'
        }
        await db.Profils.create(profil)
        await db.Preferences.create({idUtilisateur: user.idUtilisateur})

        if (genre === 'e') {
            const entreprise = await db.Entreprises.create({
                raisonSociale,
                registreCommerce,
                dateCreation,
                siegeSocial,
                logo,
                email: emailEntreprise
            })
            await db.Roles.create({
                idUtilisateur: user.idUtilisateur,
                idEntreprise: entreprise.idEntreprise,
                role: 'administrateur'
            })
        }

        let code = false
        if (empty(otp)) {
            code = helpers.utils.generateKey()
            otp = {
                tel: user.tel,
                email: user.email,
                code
            }
        }
        helpers.otp.saveSync(otp)

        let sended = {}
        for (key in user.dataValues) {
            if (key !== 'mdp') {
                sended[key] = user[key]
            }
        }

        if (sync && sync === 'false' && code != false) {
            /* helpers.api.post('synchro/signup', {
                idUtilisateur: sended.idUtilisateur,
                avatar: photo,
                photo: sended.avatar,
                otp,

                nom,
                prenom,
                email,
                tel,
                mdp,
                dateNaiss,
                genre,
                userCode
            }) */
            helpers.mailer().to(sended.email).subject('Code d\'activation').send('otp', { code })
        }

        return res.success(res.translate('inscription_reussie'), sended, 201)
    } catch (error) {
        console.log('error', error);
    }
}

/**
 * Activation du compte
 */
exports.activeAccount = async(req, res) => {
    const email = req.body.email,
        tel = req.body.tel,
        code = req.body.code

    const sync = req.body.sync

    try {
        await db.Utilisateurs.update({ statutUtilisateur: true }, {
            where: {
                [db.Op.or]: { email, tel }
            }
        })

        if (!empty(code)) {
            helpers.otp.remove(u => u.code != code)
        }
        if (sync && sync === 'false') {
            helpers.api.post('synchro/active-account', { email, tel, code })
        }

        return res.success(res.translate('compte_activer_avec_succes'))
    } catch (err) {
        console.log('error', err);
        return res.fail(res.translate('erreur.activation_compte'))
    }
}

/**
 * Change le mot de passe 
 */
exports.updatePassword = async(req, res) => {
    const email = req.body.email,
        tel = req.body.tel,
        mdp = req.body.mdp,
        sync = req.body.sync

    try {
        await db.Utilisateurs.update({ mdp: bcrypt.hashSync(mdp, 5) }, { where: { email, tel } })

        if (sync && sync === 'false') {
            helpers.api.post('synchro/update-password', { email, tel, mdp })
            helpers.otp.remove(u => (u.email != email && u.tel != tel), 'reset-password')
        }
        return res.success(res.translate('mot_de_passe_modifier_avec_succes'))
    } catch (err) {
        console.log('erreur', err)
        return res.fail(res.translate('erreur.modification_mdp'))
    }
}