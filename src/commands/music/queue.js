const Base = require("../../services/Command");

module.exports = class Queue extends Base {
    constructor(client) {
        super(client, {
            name: 'queue',
            aliases: ['q', 'lista'],
            category: "categories:music",
            description: 'descriptions:queue',
            requiresPlayer: true,
            slash: true
        })
    }

    async run({ message, args, player }, t) {

        if (!player.queue.size) return message.respond(t('commands:queue.noQueue', { member: message.author.id }))

        let paginas = Math.ceil(player.queue.length / 10);
        let pagina = 1;
        let array = [];
        let index = 0;

        let embed = new this.client.embed()
            .setAuthor(t('commands:queue.embedAuthor'), this.client.user.displayAvatarURL());

        const pushArray = async () => {
            array = [];

            for (let i = pagina * 10 - 10; i < (pagina * 10) && i < player.queue.length; i++) {
                embed.setFooter(paginas === 1 ? t('commands:queue.footer1') : t('commands:queue.footer2', { pagina: pagina, paginas: paginas }), this.client.user.displayAvatarURL())

                const song = player.queue[i]
                array.push(`**${i + 1}** - \`\`${song.title.length > 30 ? song.title.substring(0, 30) + '...' : song.title}\`\` [${song.requester}] `)
            }
        };

        await pushArray();

        await embed.setDescription(`${t('commands:queue:embed.playing', {
            url: player.queue.current.uri, title: player.queue.current.title.length > 30 ? player.queue.current.title.substring(0, 30) + '...' : player.queue.current.title
        })} 
        ${t('commands:queue:embed.totalTime', { time: await this.convertTime(player.queue.duration) })}
        ${t('commands:queue:embed.description')}

        ${array.join("\n")}`)

        const msg = await message.quote(embed);

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

                            await embed.setDescription(`${t('commands:queue:embed.playing', {
                                url: player.queue.current.uri, title: player.queue.current.title.length > 30 ? player.queue.current.title.substring(0, 30) + '...' : player.queue.current.title
                            })} 
        ${t('commands:queue:embed.totalTime', { time: await this.convertTime(player.queue.duration) })}
        ${t('commands:queue:embed.description')}

        ${array.join("\n")}`)

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

                            await embed.setDescription(`${t('commands:queue:embed.playing', {
                                url: player.queue.current.uri, title: player.queue.current.title.length > 30 ? player.queue.current.title.substring(0, 30) + '...' : player.queue.current.title
                            })} 
                            ${t('commands:queue:embed.totalTime', { time: await this.convertTime(player.queue.duration) })}
                            ${t('commands:queue:embed.description')}
                    
                            ${array.join("\n")}`)

                            await msg.edit(embed)

                            break;
                    }
                })
        }
    }
}