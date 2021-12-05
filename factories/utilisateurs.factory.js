const pij = require('php-in-js')
const  { empty, strlen, uniqid} = pij

const helpers = require('../utils')

exports.create = async(data) => {
    const nom = data.nom,
        prenom = data.prenom,
        email = data.email || '',
        tel = data.tel,
        mdp = data.mdp || uniqid(),
        dateNaiss = data.dateNaiss,
        genre = (data.genre || '')[0].toLowerCase(),
        avatar = data.avatar || ''

    const raisonSociale = req.body.raisonSociale || '',
        registreCommerce = req.body.registreCommerce || '',
        siegeSocial = req.body.siegeSocial || '',
        emailEntreprise = req.body.emailEntreprise || '',
        dateCreation = req.body.dateCreation || '',
        logo = req.body.logo || ''

    if (empty(nom) || empty(prenom) || empty(email) || empty(tel) || empty(mdp) || empty(genre) || (genre != 'entreprise' && empty(dateNaiss))) {
        return helpers.response(res).fail('Données incomplètes', 400)
    }

    if (genre === 'entreprise') {
        if (raisonSociale == '' || registreCommerce == '' || siegeSocial == '' || emailEntreprise == '' || dateCreation == '') {
            return helpers.response(res).fail('Données de l\'entreprise incomplètes', 400)
        }
    }

    asyncLib.waterfall([
        (done) => {
            db.Utilisateurs.count({ where: { email } }).then(exist => {
                if (exist) {
                    return helpers.response(res).fail('Un utilisateur avec cette adresse email existe déjà', 409)
                }
                done(null)
            }).catch(err => {
                return helpers.response(res).fail('Une erreur s\'est produite')
            })
        },
        (done) => {
            db.Utilisateurs.count({ where: { tel } }).then(exist => {
                if (exist) {
                    return helpers.response(res).fail('Un utilisateur avec ce numéro de téléphone existe déjà', 409)
                }
                done(null)
            }).catch(err => {
                return helpers.response(res).fail('Une erreur s\'est produite')
            })
        },
        (done) => {
            if (genre === 'entreprise') {
                db.Entreprises.count({ where: { registreCommerce } }).then(exist => {
                    if (exist) {
                        return helpers.response(res).fail('Une entreprise ayant ce registre de commerce existe déjà', 409)
                    }
                }).catch(err => {
                    return helpers.response(res).fail('Une erreur s\'est produite')
                })
            }
            done(null)
        },
        (done) => {
            if (genre === 'entreprise') {
                db.Entreprises.count({ where: { email: emailEntreprise } }).then(exist => {
                    if (exist) {
                        return helpers.response(res).fail('Une entreprise ayant cette adresse email existe déjà', 409)
                    }
                }).catch(err => {
                    return helpers.response(res).fail('Une erreur s\'est produite')
                })
            }
            done(null)
        },
        (done) => {
            db.Utilisateurs.create({
                nom,
                prenom,
                email,
                tel,
                genre,
                dateNaiss,
                avatar,
                mdp: bcrypt.hashSync(mdp, 5)
            }).then(user => {
                done(null, user)
            }).catch(err => {
                return helpers.response(res).fail('Une erreur s\'est produite')
            })
        },
        (user, done) => {
            db.Comptes.bulkCreate(['loyer', 'principal'].map(typeCompte => ({
                    typeCompte,
                    idUtilisateur: user.idUtilisateur
                })))
                /* 
                            (['loyer', 'principal']).forEach(compte => {
                                db.Comptes.create({
                                    idUtilisateur: user.idUtilisateur,
                                    typeCompte: compte,
                                })
                            }) */
            done(null, user)
        },
        (user, done) => {
            if (genre === 'entreprise') {
                db.Entreprises.create({
                    raisonSociale,
                    registreCommerce,
                    dateCreation,
                    siegeSocial,
                    logo,
                    email: emailEntreprise
                }).then(entreprise => {
                    done(null, user, entreprise)
                }).catch(err => {
                    return helpers.response(res).fail('Une erreur s\'est pdddroduite [' + err + ']')
                })
            } else {
                done(null, user, null)
            }
        },
        (user, entreprise, done) => {
            if (genre === 'entreprise') {
                db.Roles.create({
                    idUtilisateur: user.idUtilisateur,
                    idEntreprise: entreprise.idEntreprise,
                    role: 'administrateur'
                }).then(role => {}).catch(err => {
                    return helpers.response(res).fail('Une erreur s\'est produite')
                })
            }

            if (sync && sync === 'false') {
                done(null, user)
            } else {
                done(user, false)
            }
        },
        (user, done) => {
            let code = helpers.utils.generateKey()

            helpers.utils.saveOTP({
                tel: user.tel,
                email: user.email,
                code
            }, (err) => {
                done(user, code)
            })
        }
    ], (user, code) => {
        let sended = {}

        console.log('code', code);
        for (key in user.dataValues) {
            if (key !== 'mdp') {
                sended[key] = user[key]
            }
        }
        if (code != false) {
            helpers.mailer().to(sended.email).subject('Code d\'activation').send('otp', { code })
        }

        /*  helpers.api.post('synchro/signup', {
             nom,
             prenom,
             email,
             tel,
             mdp,
             dateNaiss,
             avatar
         }) */

        return helpers.response(res).success('Inscription reussie', sended, 201)
    })
}