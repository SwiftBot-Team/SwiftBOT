const Base = require("../../services/Command");

class Stoptts extends Base {
    constructor(client) {
        super(client, {
            name: "stoptts",
            description: "descriptions:stoptts",
            category: "categories:utils",
            cooldown: 1000,
            aliases: ['parar-tts'],
            requiresChannel: true
        })
    }

    async run({ message, args, prefix }, t) {

        const tts = this.client.tts.get(message.guild.id)

        if (!tts) return message.respond('Eu não estou reproduzindo nada no momento.');

        if(typeof tts.end === 'function') tts.end();
        else this.client.tts.delete(message.guild.id);
        
        message.react('👍')


    }
}
module.exports = Stoptts
