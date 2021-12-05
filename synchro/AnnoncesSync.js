/**
 * Synchronisation des annonces
 */


const pij = require('php-in-js')
const md5 = require('md5')

const utils = require(__dirname + '/../utils')
const env = require(__dirname + '/../config/env')

const { empty, strlen, uniqid } = pij