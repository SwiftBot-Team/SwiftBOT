const Base = require("../../services/Command");

const { vibrato } = require('../../services/filters.js');

class vibratoCommand extends Base {
    constructor(client) {
        super(client, {
            name: "vibrato",
            description: "descriptions:vibrato",
            category: "categories:filters",
            usage: "usages:vibrato",
            cooldown: 5000,
            aliases: [],
            requiresChannel: true
        })
    }

    async run({ message, args, prefix, player, tts }, t) {

        if (player.filters.find(f => f.name === 'vibrato')) {

            player.filters.splice(player.filters.indexOf(player.filters.find(f => f.name === 'vibrato')), 1);

            player.node.send({
                op: "filters",
                guildId: message.guild.id,
                ...Object.assign({}, ...player.filters.map(f => f.value))
            });
        } else {

            player.filters.push({
                name: 'vibrato',
                value: vibrato
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
module.exports = vibratoCommand
