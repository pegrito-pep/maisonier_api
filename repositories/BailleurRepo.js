/**
 * Repositories du bailleurs
 */
const db = require('../models')

/**
 * Liste des occupations d'un bailleur
 * 
 * @param {String} idBailleur
 * @return {Array}
 */
exports.occupations = async(idUtilisateur, include) => {
    if (typeof include == 'undefined') {
        include = []
    }

    return await db.Occupations.findAll({
        where: {
            idLogement: (await exports.logements(idUtilisateur)).map(elt => elt.idLogement)
        },
        include
    })
}

/**
 * Liste des logements d'un bailleur
 * 
 * @param {String} idUtilisateur 
 * @param {object[]} include 
 * @return {Array}
 */
exports.logements = async(idUtilisateur, include) => {
    if (typeof include == 'undefined') {
        include = []
    }

    return await db.Logements.findAll({
        where: {
            [db.Op.or]: {
                idUtilisateur,
                idBatiment: (await exports.batiments(idUtilisateur)).map(elt => elt.idBatiment)
            }
        },
        include
    })

}

/**
 * Liste des cites d'un bailleur
 * 
 * @param {String} idUtilisateur 
 * @param {object[]} include 
 * @return {Array}
 */
exports.cites = async(idUtilisateur, include) => {
    if (typeof include == 'undefined') {
        include = []
    }
    return await db.Cites.findAll({
        where: { idUtilisateur },
        include
    })
}

/**
 * Liste des batiments d'un bailleur
 * 
 * @param {String} idUtilisateur 
 * @return {Array}
 */
exports.batiments = async(idUtilisateur) => {
    const cites = await exports.cites(idUtilisateur, [{ model: db.Batiments, as: 'batiments' }])
    let batiments = []

    cites.forEach(cite => {
        batiments = [...batiments, ...cite.batiments]
    })
    
    return batiments
}