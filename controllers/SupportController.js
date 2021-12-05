const { empty } = require("php-in-js");
const mailer = require('../utils/mailer')
const validator = require('validator')
const {contact_support} = require('../config/email.json')


exports.sendIssue = (req, res) => {
    const {email, message} = req.body;

    if (empty(email) || empty(message)) {
        return res.fail(res.translate('donnees_incompletes'), 400)
    }
    if (!validator.isEmail(email)) {
        return res.fail(res.translate('email_invalide'), 400)
    }

    mailer().to(contact_support).replyTo(email).subject('Message du support du Maisonier').send('support-email', {message, email})
    
    return res.success(res.translate('votre_demande_a_ete_transmise'))
}