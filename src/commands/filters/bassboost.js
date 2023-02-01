
const Base = require("../../services/Command");

const { bassboost } = require('../../services/filters.js');

class bassboostCommand extends Base {
    constructor(client) {
        super(client, {
            name: "bassboost",
            description: "descriptions:bassboost",
            category: "categories:filters",
            usage: "usages:bassboost",
            cooldown: 5000,
            aliases: [],
            requiresChannel: true
        })
    }

    async run({ message, args, prefix, player, tts }, t) {

        if (player.filters.find(f => f.name === 'bassboost')) {

            player.filters.splice(player.filters.indexOf(player.filters.find(f => f.name === 'bassboost')), 1);

            player.node.send({
                op: "filters",
                guildId: message.guild.id,
                ...Object.assign({}, ...player.filters.map(f => f.value))
            });
        } else {

            player.filters.push({
                name: 'bassboost',
                value: bassboost
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
module.exports = bassboostCommand