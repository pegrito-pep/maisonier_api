const fs = require('fs')

/**
 * Sauvegarde un OTP dans le fichier temporaire
 * 
 * @param {Object} data 
 * @param {String|Function} file 
 * @param {Function} callback 
 */
exports.save = (data, file, callback) => {
    if (!callback && typeof file != 'string') {
        callback = file
        file = 'otp'
    }
    exports.get(file, (err, otp) => {
        otp.push(data)
        exports.set(otp, file, callback)
    })
}
exports.saveSync = (data, file) => {
    if (typeof file == 'undefined') {
        file = 'otp'
    }
    let otp = exports.getSync(file)

    otp.push(data)
    exports.setSync(otp, file)
}

/**
 * Modifie les OTP
 * 
 * @param {Object} data 
 * @param {String|Function} file 
 * @param {Function} callback
 */
exports.set = (data, file, callback) => {
    if (!callback && typeof file != 'string') {
        callback = file
        file = 'otp'
    }
    fs.writeFile(filePath(file), JSON.stringify(data), (err) => {
        if (typeof callback === 'function') {
            return callback(err)
        }
    })
}
exports.setSync = (data, file) => {
    if (typeof file == 'undefined') {
        file = 'otp'
    }
    fs.writeFileSync(filePath(file), JSON.stringify(data))
}

/**
 * Recupere les otp enregistres
 * 
 * @param {String|Function|true} file 
 * @param {Function|true} callback 
 */
exports.get = (file, callback) => {
    if (!callback && typeof file != 'string') {
        callback = file
        file = 'otp'
    }
    if (true === callback) {
        return parseOTP(fs.readFileSync(filePath(file)))
    }

    fs.readFile(filePath(file), (err, buffer) => {
        if (typeof callback === 'function') {
            return callback(err, parseOTP(buffer))
        }
    })
}
exports.getSync = (file) => {
    if (typeof file == 'undefined') {
        file = 'otp'
    }
    return parseOTP(fs.readFileSync(filePath(file)))
}

/**
 * Retire un element des otp
 * 
 * @param {Function} callback 
 * @param {String} file 
 * @returns 
 */
exports.remove = (callback, file) => {
    if (!file || typeof file == 'undefined') {
        file = 'otp'
    }
    let otp = exports.getSync(file)

    return exports.set(otp.filter(user => callback(user)), file)
}

/**
 * Recupere un otp precis
 * 
 * @param {Function} callback 
 * @param {String} file 
 */
exports.findOne = (callback, file) => {
    return exports.findAll(callback, file)[0] || null
}
exports.findAll = (callback, file) => {
    return exports.getSync(file).filter(otp => callback(otp)).reverse()
}

/**
 * @param {Buffer} buffer 
 * @returns {Object}
 */
const parseOTP = (buffer) => {
    let otp = buffer.toString()

    if (!otp) {
        otp = []
    }
    return JSON.parse(otp)
}

/**
 * Chemin absolue vers un fichier d'OTP 
 * 
 * @param {String} name 
 * @return {String}
 */
const filePath = (name) => {
    return __dirname + '/../' + name + '.json'
}