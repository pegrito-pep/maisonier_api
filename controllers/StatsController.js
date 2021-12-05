const dayjs = require('dayjs')
const { empty } = require('php-in-js')
const db = require('../models')
const bailleurRepo = require('../repositories/BailleurRepo')
const { calcul_consommation_indexe } = require('../services/OccupationsService')
const { isThisMonth } = require('../utils/utils')

exports.all = async(req, res) => {

    // Recuperer le total des logements d'un bailleur
    const logements = await db.Logements.findAll({ where: { idUtilisateur: req.user.idUtilisateur, statutLogement: true } })
    const nbrLogement = logements.length
    const nbrLogementLibre = logements.filter(elt => elt.etatLogement == false).length
        
    const locataires = (await db.Locataires.findAll({ 
        where: { idBailleur: req.user.idUtilisateur }, 
        include: [{model: db.Occupations, as: 'occupations'}]
    })).map(elt => elt.dataValues)
    const nbrLocataire = locataires.length
    const nbrLocataireFemme = locataires.filter(elt => elt.titre.toLowerCase() != 'm' && elt.titre.toLowerCase() != 'mr').length
    const nbrLocataireHomme = locataires.filter(elt => elt.titre.toLowerCase() == 'm' || elt.titre.toLowerCase() == 'mr').length
    const nbrLocataireActif = locataires.filter(elt => elt.occupations.length > 0).length
    
    const occupations = (await db.Occupations.findAll({
        where: { idLogement: (await bailleurRepo.logements(req.user.idUtilisateur)).map(elt => elt.idLogement), dateFin: { [db.Op.is]: null } },
        include: [
            { model: db.Charges, as: 'charges' },
            { model: db.Loyers, as: 'loyers' },
            { model: db.Indexes, as: 'indexes' },
        ]
    })).map(elt => elt.dataValues)
    let montantAttendu = 0, montantPercu = 0
    let montantAttenduMois = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], montantPercuMois = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    const periodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
    occupations.forEach(occupation => {
       periodes.forEach((mois, index) => {
            montantAttenduMois[index] += occupation.loyers.map(elt => elt.dataValues).filter(elt => isThisMonth(elt.periode, mois)).reduce((accumulator, current) => accumulator + current.montant, 0)
            montantPercuMois[index] += occupation.loyers.map(elt => elt.dataValues).filter(elt => isThisMonth(elt.periode, mois)).reduce((accumulator, current) => accumulator + current.montantPayer, 0)

            montantAttenduMois[index] += occupation.charges.map(elt => elt.dataValues).filter(elt => isThisMonth(elt.periode, mois)).reduce((accumulator, current) => accumulator + current.montant, 0)
            montantPercuMois[index] += occupation.charges.map(elt => elt.dataValues).filter(elt => isThisMonth(elt.periode, mois)).reduce((accumulator, current) => accumulator + current.montantPayer, 0)

            montantAttenduMois[index] += occupation.indexes.map(elt => elt.dataValues).filter(elt => isThisMonth(elt.periode, mois) && elt.typeIndexe == 'eau').reduce((accumulator, current) => accumulator + calcul_consommation_indexe(occupation, current, 'eau'), 0)
            montantPercuMois[index] += occupation.indexes.map(elt => elt.dataValues).filter(elt => isThisMonth(elt.periode, mois) && elt.typeIndexe == 'eau').reduce((accumulator, current) => accumulator + current.avance, 0)
            
            montantAttenduMois[index] += occupation.indexes.map(elt => elt.dataValues).filter(elt => isThisMonth(elt.periode, mois) && elt.typeIndexe == 'energie').reduce((accumulator, current) => accumulator + calcul_consommation_indexe(occupation, current, 'energie'), 0)
            montantPercuMois[index] += occupation.indexes.map(elt => elt.dataValues).filter(elt => isThisMonth(elt.periode, mois) && elt.typeIndexe == 'energie').reduce((accumulator, current) => accumulator + current.avance, 0)
        })
    });
    montantAttendu = montantAttenduMois[periodes.findIndex(elt => elt == dayjs().format('MM'))]
    montantPercu = montantPercuMois[periodes.findIndex(elt => elt == dayjs().format('MM'))]

    // select count(idOccupation) from occupations inner join logements on logements.idLogement = occupations.idOccupation where dateFin is null and idUtilisateur = ? ans statutLogement = true
    /* const nbrLocataire = await db.Occupations.count({
        where: {
            dateFin: {
                [db.Op.is]: null
            }
        },
        include: [
            { model: db.Logements, as: 'logement', where: { idUtilisateur: req.user.idUtilisateur, statutLogement: true } }
        ]
    }) */

    return res.success('Statistiques', {
        nbrLocataire,
        nbrLocataireFemme,
        nbrLocataireHomme,
        nbrLocataireActif,
        nbrLogement,
        nbrLogementLibre,
        montantAttendu,
        montantPercu,
        montantAttenduMois,
        montantPercuMois,
        recetteMensuelle: 0,
        grosImpayer: [{
            nomLocataire: '',
            refLogement: '',
            montant: 0
        }],
        dernieresRecettes: [{
            nomLocataire: '',
            refLogement: '',
            montant: 0
        }]
    })
}



exports.batiments = async(req, res) => {
    const batiments =  (await bailleurRepo.batiments(req.user.idUtilisateur)).map(elt => elt.dataValues)

    for (let i = 0; i < batiments.length; i++) {
        batiments[i].logements = await db.Logements.findAll({
            where: { idBatiment: batiments[i].idBatiment, statutLogement: true }
        })
    }
    
    return res.success(res.translate('liste_des_batiments_de_l_utilisateur'), batiments)
}

/**
 * Nombre total de batiments d'un utilisateur
 */
exports.nbrBatiments = async(req, res) => {
    const batiments =  (await bailleurRepo.batiments(req.user.idUtilisateur)).map(elt => elt.dataValues)

    return res.success(res.translate('nbr_de_batiment'), batiments.length)
}
/**
 * Nombre total de logements d'un utilisateur
 */
exports.nbrLogements = async(req, res) => {
    const logements =  (await bailleurRepo.logements(req.user.idUtilisateur)).map(elt => elt.dataValues)

    return res.success(res.translate('nbr_de_logement'), logements.length)
}
/**
 * Nombre total de locataires d'un utilisateur
 */
exports.nbrLocataires = async(req, res) => {
    const nbrLocataire = (await db.Locataires.count({where: { idBailleur: req.user.idUtilisateur }}))

    return res.success(res.translate('nbr_de_locataire'), nbrLocataire)
}
