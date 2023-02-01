
const Base = require("../../services/Command");

const { daycore } = require('../../services/filters.js');

class Daycore extends Base {
    constructor(client) {
        super(client, {
            name: "daycore",
            description: "descriptions:daycore",
            category: "categories:filters",
            usage: "usages:daycore",
            cooldown: 5000,
            aliases: [],
            requiresChannel: true
        })
    }

    async run({ message, args, prefix, player, tts }, t) {

        if (player.filters.find(f => f.name === 'daycore')) {

            player.filters.splice(player.filters.indexOf(player.filters.find(f => f.name === 'daycore')), 1);

            player.node.send({
                op: "filters",
                guildId: message.guild.id,
                ...Object.assign({}, ...player.filters.map(f => f.value))
            });
        } else {

            player.filters.push({
                name: 'daycore',
                value: daycore
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
module.exports = Daycore