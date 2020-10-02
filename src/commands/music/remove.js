const Base = require("../../services/Command");

module.exports = class Loop extends Base {
    constructor(client) {
        super(client, {
            name: 'remove',
            aliases: ['r', 'removemusic'],
            category: "categories:music",
        })
    }

    async run({ message, args }, t) {

        const player = this.client.music.players.get(message.guild.id);

        if (!args[0]) return this.respond(t('commands:remove.noArgs', { member: message.author.id }));
        if (isNaN(args[0])) return this.respond(t('commands:remove.invalidNumber', { member: message.author.id }));

        args = args.sort((a, b) => a - b);
        if (args[0] < 2) return this.respond(t('commands:remove.deny', { member: message.author.id }));

        let musicas = [];
        let music;

        for (let i in args) if (!player.queue[Number(args[i] - 1)]) return this.respond(t('commands:remove.positionNotFound', { member: message.author.id, position: args[i - 1] }));

        const first = player.queue[args[0] - 1];

        for (let i in args) {
            if (args[i] === args[0]) {
                musicas.push(player.queue[Number(args[0] - 1).title])
                player.queue.remove(Number(args[0] - 1))
            }

            else {
                musicas.push(player.queue[Number(args[i] - 1).title])
                player.queue.remove(Number(args[i] - 1) - 1)
            }
        }

        await this.respond(musicas.length === 1 ? `A musica [${first.info.title}](${first.info.uri}) foi removida com sucesso.` : `Foram removidas \`${musicas.length}\` músicas da playlist.`);
    }
}