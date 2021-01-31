const { get } = require('axios');

const path = 'https://api.ksoft.si';

module.exports = class Ksoft {
    constructor() {
        this.name = 'ksoft'
    }

    async getLyrics(data) {
        const params = {
            q: data,
            text_only: true,
            limit: 1
        };

        const query = new URLSearchParams(params);

        return await this.request(`${path}lyrics/${query}`)
    }

    async getMeme(data) {

    }

    async request(url) {

    }
}