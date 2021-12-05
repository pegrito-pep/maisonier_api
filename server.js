/**
 * Importation des modules
 */
const express = require('express')

/**
 * Initialisation de l'application
 */
const app = express()
const server = require('http').Server(app)

app.use('/api/static', express.static(__dirname + '/static'))

// Body Parser configuration
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ limit: '250mb' }))

// Gestion des requetes CORS
const cors = require('cors')
app.use(cors({ origin: "*" }))

// Gestion des langues 
const createLocaleMiddleware = require('express-locale')
app.use(createLocaleMiddleware({
    query: { name: 'lang' },
    priority: ['query', "accept-language", "default"],
    default: "fr-FR",
    allowed: ['fr-FR', 'en-US', 'en-GB']
}))
const { translator, responder } = require('./middlewares')
app.use(translator)
app.use(responder)

// Utilisation des routes
const routes = require('./router').routes
app.use('/api/', routes)

const { port, host } = require('./config/env')
server.listen(port, host, async() => {
    const { sequelize } = require('./models')
    const migrator = require('./migrations')(sequelize)

    await sequelize.sync( /* { alter: true } */ )
    await migrator.up()

    console.log(`Le serveur a demarré sur l\'hôte http://${host}:${port}`)
})