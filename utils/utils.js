const fs = require('fs')
const { imgSync } = require("base64-img")
const { baseUrl } = require("../config/env")
const dayjs = require('dayjs')


exports.characters = (type) => {
    let chars = []

    if (type == 'numeric') {
        chars = ('0123456789').split('')
    } else if (type == 'lower-alphabetic') {
        chars = ('abcdefghijklmnopqrstuvwxyz').split('')
    } else if (type == 'upper-alphabetic') {
        chars = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ').split('')
    } else if (type == 'alphabetic') {
        chars = ('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ').split('')
    } else {
        chars = ('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ').split('')
    }
    return chars
}


/**
 * Genere une cle aleatoire
 * 
 * @param {Integer} size 
 * @return {String}
 */
exports.generateKey = (size, type) => {
    size = parseInt(size || 6)
    type = type || 'numeric'

    let code = '',
        char = exports.characters(type),
        taille = char.length
    for (let i = 0; i < size; i++) {
        code += char[Math.floor(Math.random() * taille)]
    }

    return code
}

/**
 * Genere une reference unique pour un logement
 * 
 * @param {object} db 
 * @param {Integer} size 
 * @return {String} 
 */
exports.generateRefLogement = async(db, size) => {
    let code = ''
    size = size || 2
    do {
        code = exports.generateKey(size, 'upper-alphabetic')
    }
    while (await db.Logements.count({ where: { refLogement: code } }))

    return code
}

/**
 * Genere une reference unique pour une charge
 * 
 * @param {object} db 
 * @param {Integer} size 
 * @return {String} 
 */
exports.generateRefCharge = async(db, size) => {
    let code = ''
    size = size || 12
    do {
        code = exports.generateKey(size, 'upper-alphabetic')
    }
    while (await db.Charges.count({ where: { reference: code } }))

    return code
}


/**
 * Upload une image base64 sur le serveur
 * 
 * @param {String} data 
 * @param {String} folder 
 * @param {String} name 
 * @returns {String}
 */
 exports.uploadImage = (data, folder, name) => {
    try {
        const filepath = imgSync(data, `${__dirname}/../static/${folder}`, name),
            pathArr = filepath.split(/(\/|\\)/g)
            
        return `${baseUrl}/static/${folder}/${pathArr[pathArr.length - 1]}`
    }
    catch(error) {
        return ''
    }
}

/**
 * Supprime un fichier du disque
 * 
 * @param {String} filepath 
 */
exports.removeImage = (filepath) => {
    fs.unlinkSync(`${__dirname}/../static/${filepath}`)
}


exports.isThisMonth = (date, mois) => {
    let day = undefined
    if (mois != undefined && mois != null && typeof mois != 'undefined') {
        day = dayjs().format('YYYY') + '-' + mois + '-01'
    }
    return dayjs(date).format('YYYY-MM') == dayjs(day).format('YYYY-MM')
}