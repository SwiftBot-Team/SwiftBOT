const aws4 = require("aws4");

const querystring = require("querystring")

const https = require('https');

const path = 'https://polly.eu-west-1.amazonaws.com';

const credentials = {
    accessKeyId: process.env.TTS_KEY,
    secretAccessKey: process.env.TTS_SECRET_KEY
}

module.exports = class ttsAPI {
    constructor(client) {

        this.client = client;

        this.name = 'tts';

    }

    async convert(opts, callback) {
        const text = opts.text;

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

        https.get(options, res => {
            if (res.statusCode !== 200) callback(`Request falhou. Código: ${res.statusCode}`)

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
