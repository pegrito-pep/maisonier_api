const { is_int } = require('php-in-js')

module.exports = (res) => {
    exports.fail = (message, code, errors) => {
        code = code || 500

        return this.send({
            success: false,
            code,
            message,
            errors
        }, (code && is_int(code)) ? code : 500)
    }

    exports.success = (message, result, code) => {
        return this.send({
            success: true,
            message,
            result
        }, code)
    }

    exports.send = (data, status) => {
        return res.status(status || 200).send(data)
    }

    return this
}