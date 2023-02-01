
const Base = require("../../services/Command");

const { pop } = require('../../services/filters.js');

class popCommand extends Base {
    constructor(client) {
        super(client, {
            name: "pop",
            description: "descriptions:pop",
            category: "categories:filters",
            usage: "usages:pop",
            cooldown: 5000,
            aliases: [],
            requiresChannel: true
        })
    }

    async run({ message, args, prefix, player, tts }, t) {

        if (player.filters.find(f => f.name === 'pop')) {

            player.filters.splice(player.filters.indexOf(player.filters.find(f => f.name === 'pop')), 1);

            player.node.send({
                op: "filters",
                guildId: message.guild.id,
                ...Object.assign({}, ...player.filters.map(f => f.value))
            });
        } else {

            player.filters.push({
                name: 'pop',
                value: pop
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
module.exports = popCommand