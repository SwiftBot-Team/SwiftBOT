const { get } = require('axios');

const removeProtocol = (text) => text.replace(/^[a-zA-Z]+:\/\//, '')
const removePath = (text) => text.replace(/(\/(.+)?)/g, '')

module.exports = class IsItUp {
    constructor() {
        this.name = 'isitup'
    }

    async check(website) {
        website = removeProtocol(website)
        website = removePath(website)

        const { data } = await get(`https://isitup.org/${website}.json`)

        if (data.response_code) {
            return {
                online: true,
                code: data.response_code,
                time: data.response_time
            }
        } else {
            return {
                online: false
            }
        }
    }
}