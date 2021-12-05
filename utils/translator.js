const Polyglot = require('node-polyglot')

const messages = require('../i18n')


module.exports = (locale) => {
    const polyglot = new Polyglot({
        locale,
        phrases: messages[locale],
        interpolation: { prefix: '{{', suffix: '}}' }
    })

    /**
     * Traduction de message
     * 
     * @param {String} key 
     * @param {Object} options 
     * @returns {String}
     */
    exports.translate = (key, options) => {
        return polyglot.t(key, options)
    }

    /**
     * Etend les traductions
     * 
     * @param {Object} phrases 
     * @param {String} prefix 
     * @returns 
     */
    exports.extend = (phrases, prefix) => {
        return polyglot.extend(phrases, prefix)
    }

    return this
}