const Base = require("../../services/Command");

module.exports = class Queue extends Base {
    constructor(client) {
        super(client, {
            name: 'queue',
            aliases: ['q', 'lista'],
            category: "categories:music",
        })
    }

    async run({ message, args }, t) {
        const player = this.client.music.players.get(message.guild.id);

        let paginas = Math.ceil(player.queue.length / 15);
        let pagina = 1;
        let array = [];
        let index = 0;

        let embed = new this.client.embed()
            .setAuthor(t('commands:queue.embedAuthor'), this.client.user.displayAvatarURL());

        const pushArray = async () => {
            array = [];

            for (let i = pagina * 15 - 15; i < (pagina * 15) && i < player.queue.length; i++) {
                embed.setFooter(paginas === 1 ? t('commands:queue.footer1') : t('commands:queue.footer2', { pagina: pagina, paginas: paginas }), this.client.user.displayAvatarURL())
                array.push(player.queue[i])
            }
        };

        await pushArray();

        await embed.setDescription(`${array.map(r => `${++index} - \`${r.info.title.length > 30 ? r.info.title.substring(0, 30) + '...' : r.info.title}\` [${this.client.users.cache.get(r.info.autorID)}]`).join("\n")}`)

        const msg = await message.channel.send(embed);

        if (paginas > 1) {
            await msg.react('⏩');

            const collector = msg.createReactionCollector((r, u) => ['⏪', '⏩'].includes(r.emoji.name) && u.id === message.author.id)
                .on('collect', async (r, u) => {

                    if (message.guild.me.permissions.has('MANAGE_MESSAGES')) r.users.remove(message.author.id)
                    switch (r.emoji.name) {
                        case '⏩':
                            if (pagina === paginas) return;

                            pagina++;

                            if (pagina === paginas && message.guild.me.permissions.has('MANAGE_MESSAGES')) r.remove('⏩');
                            if (pagina === paginas && !message.guild.me.permissions.has('MANAGE_MESSAGES')) r.users.remove(this.client.user.id);

                            msg.react('⏪');
                            index = (pagina - 1) * 15;

                            await pushArray();
                            await embed.setDescription(`${array.map(r => `${++index} - \`${r.info.title.length > 30 ? r.info.title.substring(0, 30) + '...' : r.info.title}\` [${this.client.users.cache.get(r.info.autorID)}]`).join("\n")}`)

                            msg.edit(embed)

                            break;
                        case '⏪':

                            if (pagina === 1) return;

                            await pagina--;

                            if (pagina === 1 && message.guild.me.permissions.has('MANAGE_MESSAGES')) r.remove('⏪');
                            if (pagina === 1 && !message.guild.me.permissions.has('MANAGE_MESSAGES')) r.users.remove(this.client.user.id);

                            msg.react('⏩')
                            index = (pagina - 1) * 15;

                            await pushArray();

                            await embed.setDescription(`${array.map(r => `${++index} - \`${r.info.title.length > 30 ? r.info.title.substring(0, 35) + '...' : r.info.title}\` [${this.client.users.cache.get(r.info.autorID)}]`).join("\n")}`)
                            await msg.edit(embed)

                            break;
                    }
                })
        }
    }
}