/**
 * Synchronisation des données entre le Maisonnier et le Maisonier - lite
 */

const fs = require('fs')
const path = require('path');
const basename = path.basename(__filename)

let factories = {}
fs.readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        factories[file.replace(/\.factory\.js$/i, '')] = require(path.join(__dirname, file))
    })

module.exports = factories