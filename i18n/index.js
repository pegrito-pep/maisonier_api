/**
 * Internationalisation
 */

const fs = require('fs')
const path = require('path');
const basename = path.basename(__filename)

let messages = {}
fs.readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        messages[file.replace(/\.js$/i, '')] = require(path.join(__dirname, file))
    })

module.exports = messages