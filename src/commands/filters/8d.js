
const Base = require("../../services/Command");

const { eightD } = require('../../services/filters.js');

class eightDCommand extends Base {
    constructor(client) {
        super(client, {
            name: "8d",
            description: "descriptions:8d",
            category: "categories:filters",
            usage: "usages:8d",
            cooldown: 5000,
            aliases: ['eightd', 'oitod'],
            requiresChannel: true,
            requiresPlayer: true
        })
    }

    async run({ message, args, prefix, player, tts }, t) {

        if (player.filters.find(f => f.name === '8d')) {

            player.filters.splice(player.filters.indexOf(player.filters.find(f => f.name === '8d')), 1);

            player.node.send({
                op: "filters",
                guildId: message.guild.id,
                ...Object.assign({}, ...player.filters.map(f => f.value))
            });
        } else {

            player.filters.push({
                name: '8d',
                value: eightD
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
module.exports = eightDCommand