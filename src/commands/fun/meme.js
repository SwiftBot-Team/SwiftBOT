const Base = require("../../services/Command");

class Meme extends Base {
    constructor(client) {
        super(client, {
            name: "meme",
            description: "descriptions:meme",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ['random-meme']
        });
    }

    async run({ message, args, prefix }, t) {

        const { KSoftClient } = require('@ksoft/api');

        const ksoft = new KSoftClient(process.env.LYRICS_API);


        const { url } = await ksoft.images.meme()

        message.channel.send({ files: [url] })
    }
}

module.exports = Meme;