
const Base = require("../../services/Command");

const { treblebass } = require('../../services/filters.js');

class treblebassCommand extends Base {
    constructor(client) {
        super(client, {
            name: "treblebass",
            description: "descriptions:treblebass",
            category: "categories:filters",
            usage: "usages:treblebass",
            cooldown: 5000,
            aliases: [],
            requiresChannel: true
        })
    }

    async run({ message, args, prefix, player, tts }, t) {

        if (player.filters.find(f => f.name === 'treblebass')) {

            player.filters.splice(player.filters.indexOf(player.filters.find(f => f.name === 'treblebass')), 1);

            player.node.send({
                op: "filters",
                guildId: message.guild.id,
                ...Object.assign({}, ...player.filters.map(f => f.value))
            });
        } else {

            player.filters.push({
                name: 'treblebass',
                value: treblebass
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
module.exports = treblebassCommand