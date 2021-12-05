const jwt = require('jsonwebtoken');

const JWT_SIGN_SECRET = 'ghjdekjdwqe185366edflkwdq2508qwasd2dc0wed42336eda';


/**
 * Genere un token pour l'utilisateur
 * 
 * @param {Object} user 
 * @returns {String}
 */
exports.createToken = (user, expiresIn) => {
    expiresIn = expiresIn || '1h'

    return jwt.sign({
        idUtilisateur: user.idUtilisateur,
        idEntreprise: user.idEntreprise || null
    }, JWT_SIGN_SECRET, { expiresIn })
}

/**
 * Decode un token et recupere les informations de l'utilisateur
 * 
 * @param {String} authorization 
 * @returns {Object|null}
 */
exports.decode = (authorization) => {
    const token = authorization != null ? authorization.replace('Bearer ', '') : null
    let user = null
    if (token != null) {
        try {
            user = jwt.verify(token, JWT_SIGN_SECRET);
        } catch (err) {}
    }
    return user
}