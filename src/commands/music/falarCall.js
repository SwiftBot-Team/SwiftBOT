const discordTTS = require("discord-tts");

const Base = require("../../services/Command");

class falarCall extends Base {
    constructor(client) {
        super(client, {
            name: "falarCall",
            description: "descriptions:falarCall",
            category: "categories:music",
            usage: "usages:falarCall",
            cooldown: 1000,
            aliases: [],
            requiresChannel: true
        })
    }

    async run({ message, args, prefix }, t) {

        message.member.voice.channel.join().then(connection => {
            const stream = discordTTS.getVoiceStream(args.join(" "), 'pt-BR', 4);

            const dispatcher = connection.play(stream);
        })
    }
}
module.exports = falarCall