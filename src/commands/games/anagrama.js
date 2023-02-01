const Base = require("../../services/Command");

const AnagramGame = require('../../services/AnagramGame.js');

module.exports = class anagrama extends Base {
    constructor(client) {
        super(client, {
            name: 'anagrama',
            aliases: ['anagram'],
            cooldown: 10000,
            description: "descriptions:anagrama",
            category: "categories:games",
        })
    }

    async run({ message, args, prefix, games }, t) {
        if (this.client.games.anagrama.get(message.channel.id)) return message.respond(t('commands:anagrama.exists'));

        const game = new AnagramGame(this.client, message, t);

        this.client.games.anagrama.set(message.channel.id, true);

        await game.start();
    }
}
