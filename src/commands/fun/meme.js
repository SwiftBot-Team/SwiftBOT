const Base = require("../../services/Command");
const { KSoftClient } = require('@ksoft/api');

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

    async run({ message, args, prefix, language }, t) {
        return message.channel.send('<:arrow:860383273053323307> O comando "meme" se encontra em manutenção')

        const ksoft = new KSoftClient(process.env.KSOFT_API);

        const { url } = language === 'pt' ?
            await ksoft.images.reddit('MemesBrasil', { removeNSFW: true, span: 'week' }) : await ksoft.images.meme();;

        message.channel.send({ files: [url] });

    }
}

module.exports = Meme;
