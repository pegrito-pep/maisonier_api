/**
 * Synchronisation des données entre le Maisonnier et le Maisonier - lite
 */

const fs = require('fs')
const path = require('path');
const basename = path.basename(__filename)

let repositories = {}
fs.readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        repositories[file.replace(/Repo\.js$/i, '')] = require(path.join(__dirname, file))
    })

module.exports = repositories