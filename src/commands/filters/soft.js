
const Base = require("../../services/Command");

const { soft } = require('../../services/filters.js');

class softCommand extends Base {
    constructor(client) {
        super(client, {
            name: "soft",
            description: "descriptions:soft",
            category: "categories:filters",
            usage: "usages:soft",
            cooldown: 5000,
            aliases: [],
            requiresChannel: true
        })
    }

    async run({ message, args, prefix, player, tts }, t) {

        if (player.filters.find(f => f.name === 'soft')) {

            player.filters.splice(player.filters.indexOf(player.filters.find(f => f.name === 'soft')), 1);

            player.node.send({
                op: "filters",
                guildId: message.guild.id,
                ...Object.assign({}, ...player.filters.map(f => f.value))
            });
        } else {

            player.filters.push({
                name: 'soft',
                value: soft
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
module.exports = softCommand