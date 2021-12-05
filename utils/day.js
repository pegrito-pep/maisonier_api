const dayjs = require('dayjs'),
    customParseFormat = require('dayjs/plugin/customParseFormat')
const { is_string } = require('php-in-js')

dayjs.extend(customParseFormat)

/**
 * 
 * @param {String|number|Date|Boolean} date 
 * @returns 
 */
module.exports = (date, locale) => {
    if (typeof locale == 'undefined') {
        locale = 'fr'
    }
    require('dayjs/locale/' + locale)
    dayjs.locale(locale)

    exports.simple = (date) => {
        return dayjs(date)
    }

    exports.fromFormat = (date, format, strict) => {
        return dayjs(date, format, strict === true)
    }

    if (date === false) {
        return dayjs()
    }
    if (is_string(date) || date instanceof Date) {
        return dayjs(date)
    }

    return this
}