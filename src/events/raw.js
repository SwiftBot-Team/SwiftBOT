const { Message } = require('discord.js');

module.exports = class {
    constructor(client) {
        this.client = client;
        this.name = 'raw'
    }
    async run(data) {

        if (data.t === 'INTERACTION_CREATE') {

            const { MessageComponentTypes } = this.client.buttons.Constants;
            if (data.d.data.component_type === MessageComponentTypes.SELECT_MENU || data.d.data.component_type === MessageComponentTypes.BUTTON) {

                if (this.client.games.uno.array().find(u => u.channel.id === data.d.channel_id)) data.d.channel_id = this.client.games.uno.array().find(u => u.channel.id === data.d.channel_id)?.message.channel.id;

                //this.client.ws.emit('INTERACTION_CREATE', data.d)
            }



        }
        this.client.music.updateVoiceState(data);

        const { t, d } = data;

        if (!this.client.controllers.atendimentos) return;

        if (['MESSAGE_REACTION_ADD'].includes(t)) {

            if (!d.guild_id) return;

            const config = this.client.controllers.atendimentos.get(d.guild_id);

            if (!config || config.enabled === false) return;

            const emoji = d.emoji.id ? d.emoji.id : d.emoji.name;

            const guild = this.client.guilds.cache.get(d.guild_id)

            const channel = guild.channels.cache.get(d.channel_id);

            const member = guild.members.cache.get(d.user_id);

            if (member.user.bot) return;

            if (emoji === '❌' && config.abertos.find(c => c.channel === d.channel_id) && !member.user.bot) {

                const channelConfig = config.abertos.find(c => c.channel === d.channel_id);

                const user = guild.members.cache.get(channelConfig.id);

                const embed = new this.client.embed()
                    .setDescription(`${member}, seu atendimento acaba de ser fechado.`);

                if (config.allowUserClose && d.user_id === channelConfig.id) {
                    this.client.controllers.atendimentos.delete(d.user_id, d.guild_id);

                    await channel.delete();

                    if (user) user.send(embed).catch(err => err);

                    return;
                }

                const channelCategorie = config.categories.find(c => c.name === channel.name.split("-")[0]);

                if (!config.allowUserClose && d.user_id === channelConfig.id && !channelCategorie.roles.find(r => member.roles.cache.has(r))) return channel.send(new this.client.embed().setDescription(`${member}, você não tem autorização para fechar o próprio ticket.`));

                this.client.controllers.atendimentos.delete(d.user_id, d.guild_id);

                await channel.delete();

                if (user) user.send(embed).catch(err => err);

                return;
            }

            if (d.message_id !== config.messageID || d.channel_id !== config.channel) return;


            const verify = config.abertos.find(u => u.id === d.user_id && guild.channels.cache.get(u.channel));

            const category = config.categories.find(c => c.emoji === emoji);

            if (!category) return;

            let webHookOne = (await channel.fetchWebhooks().then(w => w.find(web => web.name === guild.name))) || await channel.createWebhook(guild.name, { avatar: guild.iconURL() })

            if (verify) return webHookOne.send(new this.client.embed()
                .setDescription(`${member}, você já possui um atendimento aberto. Clique aqui para ir até ele: <#${verify.channel}>`)).then(msg => { msg.delete({ timeout: 5000 }); webHookOne.delete() });

            guild.channels.create(`${category.name}-de-${member.user.username.toLowerCase().split(" ").slice("-")}`, {
                type: 'text',
                parent: config.category,
                permissionOverwrites: [
                    ...category.roles.map(r => ({
                        id: r,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES']
                    })),
                    {
                        id: d.user_id,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES']
                    },
                    {
                        id: d.guild_id,
                        deny: ['VIEW_CHANNEL']
                    }
                ]
            }).then(async c => {

                const options = { avatar: guild.iconURL() };

                let webhook = await channel.createWebhook(guild.name, options);

                await webhook
                    .send(new this.client.embed()
                        .setDescription(`Seu ticket acaba de ser criado. Clique aqui para acessá-lo: <#${c.id}>.`)).then(msg => { msg.delete({ timeout: 5000 }); webhook.delete() });

                let webhookSecond = await c.createWebhook(guild.name, options);

                this.client.controllers.atendimentos.create(d.user_id, d.guild_id, c.id);

                webhookSecond.send(new this.client.embed()
                    .setDescription(`${member}, bem-vindo ao seu atendimento.`)
                    .setFooter('Reaja abaixo com ❌ para fechar o atendimento.', guild.iconURL()))
                    .then(msg => {
                        webhookSecond.delete();

                        msg.react('❌');
                    })
            })

        }
    }

}