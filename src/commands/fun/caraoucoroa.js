const Base = require("../../services/Command");

class Caraoucoroa extends Base {
    constructor(client) {
        super(client, {
            name: "caraoucoroa",
            description: "descriptions:caraoucoroa",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ["coc"]
        });
    }

    async run({ message, args, prefix }, t) {

        const coins = {
            heads: 'https://i.imgur.com/ncyvsR1.png',
            tails: 'https://i.imgur.com/ufHrdev.png'
        }

        const lados = ['heads', 'tails']
        const chosenSide = lados[Math.floor(Math.random() * lados.length)];
        message.channel.send(new this.client.embed(message.author).setImage(coins[chosenSide]).setAuthor(t('commands:coroa.girar'), ''))
    }
}

module.exports = Caraoucoroa;