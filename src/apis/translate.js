const { get } = require('axios');

module.exports = class translate {
    constructor() {
        this.name = 'translate'
    }

    async translate(text, from, to) {
        const options = {
            q: text,
            sl: from,
            tl: to,
        };

        const query = new URLSearchParams(options);

        return get(`https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&${query.toString()}`)
            .then(res => {

                return {
                    result: res.data[0].map(e => e[0]).join(""),
                    from: res.data[2]
                }
            });
    }
}