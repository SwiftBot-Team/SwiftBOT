const aws4 = require("aws4");

const querystring = require("querystring")

const { get } = require('https');

const path = 'https://polly.eu-west-1.amazonaws.com';

const credentials = {
    accessKeyId: process.env.tts_key,
    secretAccessKey: process.env.tts_secret_key
}

module.exports = class ttsAPI {
    constructor(client) {

        this.client = client;

        this.name = 'tts';

    }

    async convert(opts, callback) {
        const text = await this.translate(opts)

        const query = {
            Text: text,
            TextType: 'text',
            VoiceId: opts.voice,
            SampleRate: 22050,
            OutputFormat: 'mp3'
        };

        const options = {
            service: "polly",
            region: "eu-west-1",
            path: "/v1/speech?" + querystring.stringify(query),
            signQuery: true
        };

        aws4.sign(options, credentials);

        get(options, res => {
            // console.log(res);

            callback(null, res);
        })
    }

    async translate(options) {
        const text = options.text;

        const language = options.language;

        const names = {
            árabe: 'ar',
            chinês: 'zh-cn',
            inglês: 'en',
            francês: 'fr',
            italiano: 'it',
            japonês: 'ja',
            português_brasil: 'pt',
            português_portugal: 'pt',
            russo: 'ru',
            espanhol: 'es',
            koreano: 'ko'
        };

        const translated = await this.client.apis.translate.translate(text, 'auto', names[language]);

        return translated.result;
    }
}