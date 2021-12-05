const axios = require('axios');
const { apiUrl } = require('../config/env')

module.exports = {
    request: function(method, url, data) {
        if (typeof data == 'undefined') {
            data = {}
        }
        return axios({
            url: `${apiUrl}/${url}`,
            data,
            method,
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            }
        }).then(response => {
            return response.data
        }).catch(error => {
            throw error
        })
    },

    delete: async function(url, data) {
        return this.request('delete', url, data)
    },

    get: async function(url, data) {
        return this.request('get', url, JSON.stringify(data))
    },

    post: async function(url, data) {
        return this.request('post', url, data)
    },

    put: async function(url, data) {
        return this.request('put', url, data)
    },

    patch: async function(url, data) {
        return this.request('patch', url, data)
    },
}