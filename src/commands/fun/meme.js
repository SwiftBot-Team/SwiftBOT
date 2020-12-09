const Base = require("../../services/Command");

class Meme extends Base {
    constructor(client) {
        super(client, {
            name: "meme",
            description: "descriptions:meme",
            category: "categories:fun",
            cooldown: 1000,
            aliases: []
        });
    }

    async run({ message, args, prefix }, t) {

        const { KSoftClient } = require('@ksoft/api');

        const ksoft = new KSoftClient(process.env.KSOFT_API);

        const { url } = await ksoft.images.meme();

        console.log(url)

        message.channel.send({ files: [url] });

    }
}

module.exports = Meme;