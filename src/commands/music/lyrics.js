const Base = require("../../services/Command");

const axios = require('axios');

const cheerio = require('cheerio');

const fetch = require('node-fetch');
const { relativeTimeRounding } = require("moment");

class lyrics extends Base {
    constructor(client) {
        super(client, {
            name: "lyrics",
            description: "descriptions:lyrics",
            category: "categories:music",
            usage: "usages:lyrics",
            cooldown: 1000,
            aliases: ['letras', 'letra'],
            requiresChannel: true
        })
    }

    async run({ message, args, prefix, player }, t) {

        const { KSoftClient } = require('@ksoft/api');

        const ksoft = new KSoftClient('6874697b0a12c448b90dd8ffcc2a81bbb6db0ab6');

        const { lyrics, image } = await player.getLyrics();

        if (!lyrics) return this.respond(t('commands:lyrics.noFound', { member: message.author.id, music: player.track.info.title }));

        const pages = Math.ceil(lyrics.length / 900);

        let page = 0;

        const send = await message.channel.send(new this.client.embed()
            .setTitle(t('commands:lyrics:embed.title', { title: player.track.info.title }))
            .setDescription(lyrics.slice(0, 900))
            .setThumbnail(image)
            .setFooter(t('commands:lyrics:embed.footer', { page: page + 1, pages: pages }), this.client.user.displayAvatarURL()));

        if (pages === 1) return;

        await send.react('⏩');
        await send.react('⏪');

        send.createReactionCollector((r, u) => ['⏩', '⏪'].includes(r.emoji.name) && u.id === message.author.id)

            .on('collect', async (r, u) => {
                switch (r.emoji.name) {
                    case '⏩':
                        if (page === pages - 1) return;

                        page++;

                        send.edit(new this.client.embed()
                            .setTitle(t('commands:lyrics:embed.title', { title: player.track.info.title }))
                            .setDescription(lyrics.slice(page * 1000, (page + 1) * 900))
                            .setThumbnail(image)
                            .setFooter(t('commands:lyrics:embed.footer', { page: page + 1, pages: pages }), this.client.user.displayAvatarURL()))
                        break;

                    case '⏪':
                        if (page === 0) return;

                        page--;

                        send.edit(new this.client.embed()
                            .setTitle(t('commands:lyrics:embed.title', { title: player.track.info.title }))
                            .setDescription(lyrics.slice(page * 900, (page + 1) * 900))
                            .setThumbnail(image)
                            .setFooter(t('commands:lyrics:embed.footer', { page: page + 1, pages: pages }), this.client.user.displayAvatarURL()))
                        break;
                }
            })

    }
}
module.exports = lyrics