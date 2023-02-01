
const Base = require("../../services/Command");

const { vaporwave } = require('../../services/filters.js');

class vaporwaveCommand extends Base {
    constructor(client) {
        super(client, {
            name: "vaporwave",
            description: "descriptions:vaporwave",
            category: "categories:filters",
            usage: "usages:vaporwave",
            cooldown: 5000,
            aliases: [],
            requiresChannel: true
        })
    }

    async run({ message, args, prefix, player, tts }, t) {

        if (player.filters.find(f => f.name === 'vaporwave')) {

            player.filters.splice(player.filters.indexOf(player.filters.find(f => f.name === 'vaporwave')), 1);

            player.node.send({
                op: "filters",
                guildId: message.guild.id,
                ...Object.assign({}, ...player.filters.map(f => f.value))
            });
        } else {

            player.filters.push({
                name: 'vaporwave',
                value: vaporwave
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
module.exports = vaporwaveCommand