const express = require('express')

const controllers = require('./controllers')
const synchro = require('./synchro')
const middlewares = require('./middlewares')

exports.routes = (() => {
    let router = express.Router()

    /**
     * AUthentification
     */
    router.route('/signin').post(controllers.Auth.signin)
    router.route('/signup').post(controllers.Auth.signup)
    router.route('/check-otp').post(controllers.Auth.checkOTP)
    router.route('/forget-password').post(controllers.Auth.forgetPassword)
    router.route('/check-forget').post(controllers.Auth.checkForget)
    router.route('/update-password').put(controllers.Auth.updatePassword)
    router.route('/refresh-token').put(controllers.Auth.refreshToken)
    router.route('/resend-otp').post(controllers.Auth.resendOTP)

    /**
     * Gestions des utilisateurs
     */
    router.route('/utilisateurs').get(controllers.Utilisateurs.list)
    router.route('/utilisateurs/:id').get(controllers.Utilisateurs.single)
    router.route('/account/set-avatar').patch(middlewares.checkToken, controllers.Account.setAvatar)
    router.route('/account/profil').put(middlewares.checkToken, controllers.Account.updateProfil)
    router.route('/account/preferences').put(middlewares.checkToken, controllers.Account.updatePreferences)

    /**
     * Gestion des cites et batiments
     */
    router.route('/cites').post(middlewares.checkToken, controllers.Cites.add)
    router.route('/cites').get(middlewares.checkToken, controllers.Cites.list)
    router.route('/cites/all').get(middlewares.checkToken, controllers.Cites.all)
    router.route('/cites').delete(middlewares.checkToken, controllers.Cites.remove)
    router.route('/cites/:idCite').delete(middlewares.checkToken, controllers.Cites.remove)
    router.route('/cites/:idCite/restore').put(middlewares.checkToken, controllers.Cites.restore)
    router.route('/cites/:idCite').put(middlewares.checkToken, controllers.Cites.edit)
    router.route('/cites/:idCite/logements').get(middlewares.checkToken, controllers.Logements.list)
    router.route('/cites/:idCite/depenses').get(controllers.Depenses.list)
    router.route('/cites/:idCite/depenses-totales').get(controllers.Depenses.totales)
    router.route('/cites/:idCite/depenses').post(controllers.Depenses.add)
    router.route('/batiments').post(middlewares.checkToken, controllers.Batiments.add)
    router.route('/batiments').get(middlewares.checkToken, controllers.Batiments.list)
    router.route('/cites/:idCite/batiments').get(middlewares.checkToken, controllers.Batiments.list)
    router.route('/cites/:idCite/batiments').delete(middlewares.checkToken, controllers.Batiments.remove)
    router.route('/cites/:idCite/batiments/restore').put(middlewares.checkToken, controllers.Batiments.restore)
    router.route('/batiments/:idBatiment').delete(middlewares.checkToken, controllers.Batiments.remove)
    router.route('/batiments').delete(middlewares.checkToken, controllers.Batiments.remove)
    router.route('/batiments/restore').put(middlewares.checkToken, controllers.Batiments.restore)
    router.route('/batiments/:idBatiment/restore').put(middlewares.checkToken, controllers.Batiments.restore)
    router.route('/batiments/:idBatiment').put(middlewares.checkToken, controllers.Batiments.edit)
    router.route('/batiments/:idBatiment/logements').get(middlewares.checkToken, controllers.Logements.list)
    router.route('/batiments/:idBatiment/depenses').get(controllers.Depenses.list)
    router.route('/batiments/:idBatiment/depenses-totales').get(controllers.Depenses.totales)
    router.route('/batiments/:idBatiment/depenses').post(controllers.Depenses.add)

    /**
     * Gestion des types de logements
     */
    router.route('/types-logements').post(controllers.TypesLogements.add)
    router.route('/types-logements').get(controllers.TypesLogements.list)
    router.route('/types-logements/:idType').put(controllers.TypesLogements.edit)
    router.route('/types-logements/:idType').delete(controllers.TypesLogements.remove)
    router.route('/types-logements/:idType/soustypes').get(controllers.SousTypesLogements.list)
    router.route('/types-logements/:idType/soustypes').delete(controllers.SousTypesLogements.remove)
    router.route('/soustypes-logements').post(controllers.SousTypesLogements.add)
    router.route('/soustypes-logements').get(controllers.SousTypesLogements.list)
    router.route('/soustypes-logements/:idSousType').put(controllers.SousTypesLogements.edit)
    router.route('/soustypes-logements/:idSousType').delete(controllers.SousTypesLogements.remove)

    /**
     * Gestion des logements
     */
    router.route('/logements').post(middlewares.checkToken, controllers.Logements.add)
    router.route('/logements').get(middlewares.checkToken, controllers.Logements.list)
    router.route('/logements/:idLogement/indexes').post(middlewares.checkToken, controllers.Indexes.add)
    router.route('/logements/:idLogement/indexes').get(middlewares.checkToken, controllers.Indexes.list)
    router.route('/logements/:idLogement/indexes').put(middlewares.checkToken, controllers.Indexes.buy)
    router.route('/logements/:idLogement/annonces').post(middlewares.checkToken, controllers.Annonces.add)
    router.route('/logements/:idLogement/annonces').get(middlewares.checkToken, controllers.Annonces.list)
    router.route('/logements/:idLogement/annonces').delete(middlewares.checkToken, controllers.Annonces.remove)
    router.route('/logements/:idLogement/occupations').get(middlewares.checkToken, controllers.Occupations.list)
    router.route('/logements/:idLogement/contrats').get(middlewares.checkToken, controllers.Contrats.list)
    router.route('/logements/:idLogement/depenses').get(controllers.Depenses.list)
    router.route('/logements/:idLogement/depenses-totales').get(controllers.Depenses.totales)
    router.route('/logements/:idLogement/loyers').get(controllers.Loyers.list)
    router.route('/logements/:idLogement/modele-contrat').get(controllers.ModelesContrats.list)
    router.route('/logements/:idLogement/depenses').post(controllers.Depenses.add)
    router.route('/logements/:idLogement/clone').post(controllers.Logements.clone)
    router.route('/logements/:idLogement').put(middlewares.checkToken, controllers.Logements.edit)
    router.route('/logements/:idLogement').delete(middlewares.checkToken, controllers.Logements.delete)

    router.route('/depenses').get(middlewares.checkToken, controllers.Depenses.list)
    router.route('/depenses-totales').get(middlewares.checkToken, controllers.Depenses.totales)

    /**
     * Gestion des annonces
     */
    router.route('/annonces').post(middlewares.checkToken, controllers.Annonces.add)
    router.route('/annonces').get(controllers.Annonces.list)
    router.route('/annonces/sociale').get(controllers.Annonces.listSociale)
    router.route('/annonces/:idAnnonce/sociale').get(controllers.Annonces.detailsSociale)
    router.route('/annonces/all').get(controllers.Annonces.all)
    router.route('/annonces/:idAnnonce/unpublish').put(middlewares.checkToken, controllers.Annonces.unpublish)
    router.route('/annonces/:idAnnonce/publish').put(middlewares.checkToken, controllers.Annonces.publish)
    router.route('/annonces/:idAnnonce').put(middlewares.checkToken, controllers.Annonces.edit)
    router.route('/annonces/:idAnnonce').delete(middlewares.checkToken, controllers.Annonces.remove)
    router.route('/annonces/:idAnnonce/propositions').get(controllers.Annonces.listPropositions)
    router.route('/annonces/:idAnnonce/propositions').post(middlewares.checkToken, controllers.Annonces.addProposition)

    /**
     * Gestion des locataires et occupations
     */
    router.route('/insolvables').get(middlewares.checkToken, controllers.Locataires.insolvables)
    router.route('/locataires').post(middlewares.checkToken, controllers.Locataires.create)
    router.route('/locataires').get(middlewares.checkToken, controllers.Locataires.list)
    router.route('/locataires/:idLocataire/logements').get(controllers.Locataires.logements)
    router.route('/locataires/:idLocataire/occupations').get(controllers.Occupations.list)
    router.route('/locataires/:idLocataire/charges').get(controllers.Charges.list)
    router.route('/locataires/:idLocataire/loyers').get(controllers.Loyers.list)
    router.route('/locataires/:idLocataire/contrats').get(middlewares.checkToken, controllers.Contrats.list)

    router.route('/occupations').post(middlewares.checkToken, controllers.Occupations.add)
    router.route('/occupations/:idOccupation/annonces').get(controllers.Annonces.list)
    router.route('/occupations/:idOccupation/charges').post(middlewares.checkToken, controllers.Charges.add)
    router.route('/occupations/:idOccupation/charges').get(controllers.Charges.list)
    router.route('/occupations/:idOccupation/comptes').get(controllers.Comptes.list)
    router.route('/occupations/:idOccupation/indexes').get(controllers.Indexes.list)
    router.route('/occupations/:idOccupation/loyers').get(controllers.Loyers.list)
    router.route('/occupations/:idOccupation/pay-facture').post(middlewares.checkToken, controllers.Loyers.payFacture)
    router.route('/occupations/:idOccupation/contrats').post(middlewares.checkToken, controllers.Contrats.create)
    router.route('/occupations/:idOccupation/contrats').get(middlewares.checkToken, controllers.Contrats.list)
    router.route('/occupations/:idOccupation/close').put(middlewares.checkToken, controllers.Occupations.close)
    router.route('/occupations').get(middlewares.checkToken, controllers.Occupations.list)
    router.route('/occupations-lite').get(middlewares.checkToken, controllers.Occupations.listLite)
    router.route('/occupations/:idOccupation').get(middlewares.checkToken, controllers.Occupations.details)
    router.route('/occupations/:idOccupation').put(middlewares.checkToken, controllers.Occupations.edit)

    router.route('/comptes/:idCompte/recharge').post(middlewares.checkToken, controllers.Comptes.recharge)
    router.route('/comptes/recharge').post(middlewares.checkToken, controllers.Comptes.bulkRecharge)
    router.route('/comptes').post(middlewares.checkToken, controllers.Comptes.add)
    router.route('/charges/:idCharge/change-state').put(middlewares.checkToken, controllers.Charges.toggleState)
    router.route('/charges/:idCharge/buy').put(middlewares.checkToken, controllers.Charges.buy)
    router.route('/charges/auto-generate').post(middlewares.checkToken, controllers.Charges.generateCharge)

    /**
     * Gestion des articles et rubriques
     */
    router.route('/articles').post(middlewares.checkToken, controllers.Articles.add)
    router.route('/articles').get(middlewares.checkToken, controllers.Articles.list)
    router.route('/articles/generate').post(middlewares.checkToken, controllers.Articles.generate)
    router.route('/articles/restore').put(middlewares.checkToken, controllers.Articles.restore)
    router.route('/articles/restore/:idArticle').put(middlewares.checkToken, controllers.Articles.restore)
    router.route('/articles/:idArticle/restore').put(middlewares.checkToken, controllers.Rubriques.restore)
    router.route('/articles/:idArticle').put(middlewares.checkToken, controllers.Articles.edit)
    router.route('/articles').delete(middlewares.checkToken, controllers.Articles.remove)
    router.route('/articles/:idArticle/rubriques').delete(middlewares.checkToken, controllers.Rubriques.remove)
    router.route('/articles/:idArticle').delete(middlewares.checkToken, controllers.Articles.remove)
    router.route('/articles/:idArticle/rubriques').get(middlewares.checkToken, controllers.Rubriques.list)
    router.route('/articles/:idArticle/rubriques').post(middlewares.checkToken, controllers.Rubriques.add)
    router.route('/rubriques/:idRubrique/restore').put(middlewares.checkToken, controllers.Rubriques.restore)
    router.route('/rubriques/:idRubrique').delete(middlewares.checkToken, controllers.Rubriques.remove)
    router.route('/rubriques/:idRubrique').put(middlewares.checkToken, controllers.Rubriques.edit)
    router.route('/rubriques').get(middlewares.checkToken, controllers.Rubriques.list)
    router.route('/rubriques').post(middlewares.checkToken, controllers.Rubriques.add)

    /**
     * Gestion des contrats
     */
    router.route('/modeles-contrats').post(middlewares.checkToken, controllers.ModelesContrats.create)
    router.route('/modeles-contrats').get(middlewares.checkToken, controllers.ModelesContrats.list)
    router.route('/modeles-contrats/:idModele').get(middlewares.checkToken, controllers.ModelesContrats.list)
    router.route('/modeles-contrats/:idModele/associate').put(middlewares.checkToken, controllers.ModelesContrats.associate)
    router.route('/templates-contrats').post(controllers.TemplatesContrats.create)
    router.route('/templates-contrats').get(controllers.TemplatesContrats.list)
    router.route('/templates-contrats/:idTemplate').get(controllers.TemplatesContrats.list)
    router.route('/templates-contrats/:idTemplate').put(controllers.TemplatesContrats.edit)
    router.route('/templates-contrats/:idTemplate').delete(controllers.TemplatesContrats.remove)
    router.route('/contrats').post(middlewares.checkToken, controllers.Contrats.create)
    router.route('/contrats').get(middlewares.checkToken, controllers.Contrats.list)
    router.route('/contrats/:idContrat').get(middlewares.checkToken, controllers.Contrats.list)
    router.route('/contrats/:idContrat').put(middlewares.checkToken, controllers.Contrats.edit)
    router.route('/contrats/:idContrat').delete(middlewares.checkToken, controllers.Contrats.remove)

    /**
     * Constants
     */
    router.route('/constants/types-charges').get(controllers.Constants.typesCharges)

    /**
     * Statistiques
     */
    router.route('/stats').get(middlewares.checkToken, controllers.Stats.all)
    router.route('/stats/batiments').get(middlewares.checkToken, controllers.Stats.batiments)
    router.route('/stats/nbr-batiments').get(middlewares.checkToken, controllers.Stats.nbrBatiments)
    router.route('/stats/nbr-logements').get(middlewares.checkToken, controllers.Stats.nbrLogements)
    router.route('/stats/nbr-locataires').get(middlewares.checkToken, controllers.Stats.nbrLocataires)

    /**
     * Gestion des loyers
     */
    router.route('/loyers/generate').post(middlewares.checkToken, controllers.Loyers.saveGenerate)
    router.route('/loyers/generate').get(middlewares.checkToken, controllers.Loyers.generate)
    router.route('/loyers').get(middlewares.checkToken, controllers.Loyers.list)
    router.route('/loyers/auto-pay').post(middlewares.checkToken, controllers.Loyers.autoPay)
    router.route('/loyers/:idLoyer/buy').put(middlewares.checkToken, controllers.Loyers.buy)
    router.route('/indexes/add-multiple').post(middlewares.checkToken, controllers.Indexes.addMultiple)
    router.route('/indexes/:idIndexe/buy').put(middlewares.checkToken, controllers.Indexes.pay)

    /**
     * Synchronisation
     */
    router.route('/synchro/signup').post(synchro.Auth.signup)
    router.route('/synchro/active-account').post(synchro.Auth.activeAccount)
    router.route('/synchro/update-password').post(synchro.Auth.updatePassword)
    router.route('/synchro/set-avatar').patch(synchro.Account.setAvatar)

    router.route('/contact-support').post(controllers.Support.sendIssue)

    return router
})()