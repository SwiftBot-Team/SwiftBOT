const Base = require("../../services/Command");

class lavalink extends Base {
    constructor(client) {
        super(client, {
            name: "lavalink",
            description: "descriptions:lavalink",
            category: "categories:music",
            usage: "usages:lavalink",
            cooldown: 1000,
            aliases: ['nodeinfo'],
            devsOnly: true,
            requiresChannel: false
        })
    }

    async run({ message, args, prefix }, t) {

        const embed = new this.client.embed()
            .setAuthor('Swift - Status dos Nodes Lavalink', this.client.user.displayAvatarURL())

        this.client.music.nodes.map(node => {
            embed.addField(node.tag,
                `Players conectados: \`${node.stats.players}\`
                    Uptime: \`${this.client.msToTime(node.stats.uptime)}\`
                    RAM Usage: \`${Math.floor(node.stats.memory.used / 1000 / 1000)} MB\`
                    CPU Usage: \`${node.stats.cpu.systemLoad.toFixed(1)}%\` `)
        })

        await message.channel.send(embed)
    }
}
module.exports = lavalink