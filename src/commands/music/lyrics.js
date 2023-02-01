const Base = require("../../services/Command");

class lyrics extends Base {
    constructor(client) {
        super(client, {
            name: "lyrics",
            description: "descriptions:lyrics",
            category: "categories:music",
            usage: "usages:lyrics",
            cooldown: 5000,
            aliases: ['letras', 'letra'],
            options: [{
                name: 'music',
                type: 3,
                required: false,
                description: 'Music name to search'
            }]
        })
    }

    async run({ message, args, prefix, player }, t) {

        if (!player && !args[0]) return message.respond('Você precisa inserir um título para eu procurar!');

        const search = (player ? args[0] ? args.join(" ") : player.queue.current.title : args.join(" ")).substring(0, 50);

        const { lyrics, image } = await this.getLyrics(search);

        if (!lyrics) return message.respond(t('commands:lyrics.noFound', { member: message.author.id, music: search }));

        const pages = Math.ceil(lyrics.length / 600);

        let page = 0;

        const send = await message.quote(new this.client.embed()
            .setTitle(t('commands:lyrics:embed.title', { title: search }))
            .setDescription(lyrics.slice(page, 600))
            .setThumbnail(image)
            .setFooter(t('commands:lyrics:embed.footer', { page: page + 1, pages: pages }), this.client.user.displayAvatarURL()));

        if (pages === 1) return;

        send.delete({ timeout: 120000 }).then(err => err, (err) => err);

        await send.react('⏩');
        await send.react('⏪');

        send.createReactionCollector((r, u) => ['⏩', '⏪'].includes(r.emoji.name) && u.id === message.author.id)

            .on('collect', async (r, u) => {
                switch (r.emoji.name) {
                    case '⏩':
                        if (page === pages - 1) return;

                        page++;

                        send.edit({
                            embed: new this.client.embed()
                                .setTitle(t('commands:lyrics:embed.title', { title: search }))
                                .setDescription(lyrics.slice(page * 700, (page + 1) * 600))
                                .setThumbnail(image)
                                .setFooter(t('commands:lyrics:embed.footer', { page: page + 1, pages: pages }), this.client.user.displayAvatarURL())
                        })
                        break;

                    case '⏪':
                        if (page === 0) return;

                        page--;

                        send.edit({
                            embed: new this.client.embed()
                                .setTitle(t('commands:lyrics:embed.title', { title: search }))
                                .setDescription(lyrics.slice(page * 600, (page + 1) * 600))
                                .setThumbnail(image)
                                .setFooter(t('commands:lyrics:embed.footer', { page: page + 1, pages: pages }), this.client.user.displayAvatarURL())
                        })
                        break;
                }
            })

    }
}
module.exports = lyrics
