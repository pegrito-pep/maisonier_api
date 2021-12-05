const nodemailer = require('nodemailer')
const ejs = require('ejs')

const config = require(__dirname + '/../config/email.json')


module.exports = () => {
    data = {
        from: config.from,
        to: null,
        replyTo: null,
        subject: null,
        body: null,
        isHtml: true
    }

    /**
     * Defini l'emeteur de l'email
     * 
     * @param {String} address 
     * @param {String} name
     * 
     * @returns {self} 
     */
    exports.from = (address, name) => {
        if (name) {
            address = { address, name }
        }
        data.from = address

        return this
    }

    /**
     * Defini le(s) recepteur(s) de l'email
     * 
     * @param {String|Array} address 
     * @param {String} name
     * 
     * @returns {this} 
     */
    exports.to = (address, name) => {
        if (name) {
            address = { address, name }
        }
        data.to = address

        return this
    }

    /**
     * Defini le(s) personnes a qui on doit repondre
     * 
     * @param {String|Array} address 
     * @param {String} name
     * 
     * @returns {self} 
     */
    exports.replyTo = (address, name) => {
        if (name) {
            address = { address, name }
        }
        data.replyTo = address

        return this
    }

    /**
     * Defini le sujet du message
     * 
     * @param {String} subject
     * 
     * @returns {Self} 
     */
    exports.subject = (subject) => {
        data.subject = subject

        return this
    }

    /**
     * Defini le corps du message
     * 
     * @param {String} body 
     * @param {Boolean} isHtml 
     * 
     * @returns {Self}
     */
    exports.body = (body, isHtml) => {
        data.body = body
        data.isHtml = !(isHtml === false)

        return this
    }

    /**
     * Envoi du message
     */
    exports.send = async(filename, params) => {
        let transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: false, // true for 465, false for other ports
            auth: {
                user: config.username, // generated ethereal user
                pass: config.password, // generated ethereal password
            },
        })

        let message = {
            from: data.from,
            to: data.to,
            replyTo: data.replyTo,
            subject: data.subject
        }
        if (!filename) {
            if (data.isHtml) {
                message.html = data.body
            } else {
                message.text = data.body
            }

            transporter.sendMail(message)
        } else {
            ejs.renderFile(__dirname + '/../views/sendmail/' + filename + '.ejs', params, {}, (err, html) => {
                message.html = html

                transporter.sendMail(message)
            })
        }
    }

    return this
}