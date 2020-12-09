const { post, get } = require('axios');

const defaultUrl = 'https://api.twitch.tv/helix';

module.exports = class Twitch {

    constructor() {
        this.token = '';
    }

    async getToken() {

        await post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT}&client_secret=${process.env.TWITCH_API}&grant_type=client_credentials`)
            .then(result => {
                this.token = result.data.access_token
            })
            .catch(err => {
                console.log(`Ocorreu um erro ao pegar a API da Twitch.`)
            })
    }


    async validateUser(user) {

        user = user.replace('https://www.twitch.tv/', '').replace('https://twitch.tv/', '').replace('twitch.tv/', '');

        const params = new URLSearchParams({ login: user });

        return get(defaultUrl + '/users/?' + params.toString(), {
            headers: {
                "Client-ID": process.env.TWITCH_CLIENT,
                Authorization: `Bearer ${this.token}`
            }
        })
            .then(data => {
                return data.data
            })
            .catch(err => {
                console.log(err.message)
                if (err.message === 'Request failed with status code 401') {
                    return this.getToken()
                        .then(() => this.validateUser(user))
                }
            })
    }

    async getStreams(user) {
        const params = new URLSearchParams({ user_login: user })

        return get(defaultUrl + '/streams/?' + params.toString(), {
            headers: {
                "Client-ID": process.env.TWITCH_CLIENT,
                Authorization: `Bearer ${this.token}`
            }
        })
            .then(data => {
                return data.data
            })
            .catch(err => {

                console.log(err)

                if (err.message === 'Request failed with status code 401') {
                    return this.getToken()
                        .then(() => this.getStreams(user))
                }
            })
    }
}