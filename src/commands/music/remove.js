const Base = require("../../services/Command");

module.exports = class Loop extends Base {
    constructor(client) {
        super(client, {
            name: 'remove',
            aliases: ['r', 'removemusic'],
            category: "categories:music",
            requiresChannel: true
        })
    }

    async run({ message, args }, t) {

        const player = this.client.music.players.get(message.guild.id);

        if (!args[0]) return message.respond(t('commands:remove.noArgs', { member: message.author.id }));
        if (isNaN(args[0])) return message.respond(t('commands:remove.invalidNumber', { member: message.author.id }));

        args = args.sort((a, b) => a - b);
        if (args[0] < 1) return message.respond(t('commands:remove.deny', { member: message.author.id }));

        let musicas = [];
        let music;

        for (let i = 0; i < args.length; i++) if (!player.queue[Number(args[i] - 1)]) return message.respond(t('commands:remove.positionNotFound', { member: message.author.id, position: args[i] }));

        const first = player.queue[args[0] - 1];

        for (let i = 0; i < args.length; i++) {

            musicas.push(player.queue[Number(args[i] - 1)])
            player.queue.splice(Number(args[i]) - (i === 0 ? 1 : i + 1), 1)

        }

        await message.respond(musicas.length === 1 ? `A musica [${first.title}](${first.uri}) foi removida com sucesso.` : `Foram removidas \`${musicas.length}\` músicas da playlist.`);
    }
}