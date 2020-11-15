const Guild = require('../database/models/Guild');

module.exports = class Listeners {

    constructor(client) {

        this.client = client;

    }


    start() {

        this.client.on('giveawayEnd', async ({ guildID, channelID, messageID, winnerCount, item, autorID, time }) => {

            const guild = this.client.guilds.cache.get(guildID);

            if (!guild) return;

            const channel = this.client.channels.cache.get(channelID);

            const msg = await channel.messages.fetch(messageID);

            if (!msg) return channel.send(new this.client.embed()
                .setAuthor(t('commands:sorteio.giveawayError'), this.client.user.displayAvatarURL())
                .setFooter(t('commands:sorteio.giveawayError'), this.client.user.displayAvatarURL())
                .setDescription(t('commands:sorteio.messageNoFound')));


            this.client.database.ref(`SwiftBOT/Servidores/${guildID}/sorteios/${messageID}/status`).set('inativo');
            this.client.database.ref(`SwiftBOT/Servidores/${guildID}/sorteios/lastGiveaway`).set(messageID);

            const reactions = msg.reactions.cache.get("🎉").users.cache.array().filter(user => !user.bot);

            const t = await this.client.getTranslate(message.guild.id)

            if (reactions.length < winnerCount) return channel.send(new this.client.embed(this.client.user).setDescription(t('commands:sorteio.noReactions')));

            let message = "";


            for (let i = 0; i < winnerCount; i++) {
                let random = Math.floor(Math.random() * reactions.length)
                let user = reactions[random]
                message += `<@${user.id}> \n`
            }

            msg.edit(new this.client.embed()
                .setAuthor(t('commands:sorteio.authorEnd'), this.client.user.displayAvatarURL())
                .setFooter(t('commands:sorteio.authorEnd'), this.client.user.displayAvatarURL())
                .setDescription(t('commands:sorteio.end', {
                    autor: autorID,
                    time: time,
                    winnerCount: winnerCount,
                    item: item,
                    winners: message
                })))
        });

        this.client.on('guildBanAdd', async (member, autor, reason) => {
            if (!reason) return;

            const guild = this.client.guilds.cache.get(member.guild.id);

            const ref = await this.client.database.ref(`SwiftBOT/servidores/${guild.id}/config/modlogs`).once('value');

            if (!ref.val() || !ref.val().allowed) return;

            const channel = await guild.channels.cache.get(ref.val().channelID);


        })
    }

}