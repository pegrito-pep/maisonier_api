const env = process.env.NODE_ENV || 'development'
const ip = require('ip')

const port = process.env.PORT || 4002, 
    myIP = ip.address()

let baseUrl = `http://${myIP}:${port}`, apiUrl = 'http://192.168.100.160:4000/api'
if (env === 'production') {
    baseUrl = process.env.BASE_URL || `http://${myIP}:${port}` //'https://fse-le-maisonier.herokuapp.com' // 'http://146.59.151.26:4002'
    apiUrl = "https://fs-le-maisonier-lite.herokuapp.com/api"
}
else if (env === 'test') {
    baseUrl = 'https://fse-le-maisonier.herokuapp.com'
}

module.exports = {
    host: process.env.HOST || "0.0.0.0",
    port,
    accessTokenExp: "72h",
    refreshTokenExp: "72.5 hrs",
    apiUrl,
    baseUrl
}