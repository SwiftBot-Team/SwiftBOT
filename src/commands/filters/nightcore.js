const Base = require("../../services/Command");

const { nightcore } = require('../../services/filters.js');

class nightcoreCommand extends Base {
    constructor(client) {
        super(client, {
            name: "nightcore",
            description: "descriptions:nightcore",
            category: "categories:filters",
            usage: "usages:nightcore",
            cooldown: 1000,
            aliases: [],
            requiresChannel: true
        })
    }

    async run({ message, args, prefix, player, tts }, t) {

        if (tts) return message.respond('Estou sendo usado em TTS!');

        if (!player) return message.respond('Não estou tocando nada no momento!');

        if (player.filters.find(f => f.name === 'nightcore')) {

            player.filters.splice(player.filters.indexOf(player.filters.find(e => e.name === 'nightcore')), 1);

            player.node.send({
                op: "filters",
                guildId: message.guild.id,
                ...Object.assign({}, ...player.filters.map(f => f.value))
            });
        } else {

            player.filters.push({
                name: 'nightcore',
                value: nightcore
            });

            player.node.send({
                op: "filters",
                guildId: message.guild.id,
                ...Object.assign({}, ...player.filters.map(f => f.value))
            });
        }

        message.react('👍')
    }
}
module.exports = nightcoreCommand