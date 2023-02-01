const Command = require("../../services/Command");

const Youtube = new (require('simple-youtube-api'))(process.env.YOUTUBE_API);

class youtubenotification extends Command {
    constructor(client) {
        super(client, {
            name: "youtubenotification",
            description: "descriptions:youtubenotification",
            category: "categories:utils",
            cooldown: 1000,
            aliases: [],
            permissions: ['MANAGE_GUILD']
        })
    }

    async run({ message, args, prefix, member }, t) {

        if (!args[0]) return message.respond(t('commands:youtubenotification.noArgs', { member }));

        const db = await this.client.database.ref(`SwiftBOT/youtubenotification/${message.guild.id}`).once('value');

        if (['add', 'adicionar'].includes(args[0].toLowerCase())) {

            if (db.val() && db.val().length > 3) return message.respond(t('commands:youtubenotification:add.maxChannels', { member }));

            const url = args[1];

            if (!url) return message.respond(t('commands:youtubenotification:add.noUrl', { member, prefix }));

            const verify = await Youtube.getChannel(url).catch(err => message.respond(t('commands:youtubenotification:add.channelError', { member })));

            if (!verify) return message.respond(t('commands:youtubenotification:add.channelError', { member }));

            const verifyArray = this.client.youtubeChannels.find(c => c.id === verify.id && message.guild.channels.cache.get(c.textChannel));

            if (verifyArray) return message.respond(t('commands:youtubenotification:add.exists', { member }));

            if (!args[2]) return message.respond(t('commands:youtubenotification:add.noTextChannel', { member, prefix }))

            const textChannel = message.mentions.channels.first() || message.guild.channels.cache.get(args[2]);

            if (!textChannel || textChannel.type !== 'text') return message.respond(t('commands:youtubenotification:add.textChannelError', { member }));

            const toAdd = db.val() ? [...db.val(), { id: verify.id, textChannel: textChannel.id }] : [{ id: verify.id, textChannel: textChannel.id }];

            message.respond(t('commands:youtubenotification:add.sucess', { member }));

            this.client.database.ref(`SwiftBOT/youtubenotification/${message.guild.id}`).set(toAdd);

            this.client.youtubeChannels.push({ id: verify.id, textChannel: textChannel.id });

        }

        if (['remove', 'remover', 'rem'].includes(args[0].toLowerCase())) {
            if (!args[1]) return message.respond(t('commands:youtubenotification:remove.noArgs1', { member }));

            if (!db.val()) return message.respond(t('commands:youtubenotification:remove.noHas', { member }));

            const video = await Youtube.getChannel(args[1]).catch(err => message.respond(t('commands:youtubenotification:remove.channelError', { member })));

            if (!video) return message.respond(t('comands:youtubenotification:remove.channelError', { member }));

            const verify = db.val().find(c => c.id === video.id);

            if (!verify) return message.respond(t('commands:youtubenotification:remove.noHas', { member }));

            this.client.youtubeChannels.splice(this.client.youtubeChannels.indexOf(this.client.youtubeChannels.find(c => c.id === verify.id && c.textChannel === verify.textChannel)), 1)

            const newArray = [...this.client.youtubeChannels.filter(c => message.guild.channels.cache.get(c.textChannel))];

            this.client.database.ref(`SwiftBOT/youtubenotification/${message.guild.id}`).set(newArray);

            return message.respond(t('commands:youtubenotification:remove.sucess', { member }));
        }
    }
}
module.exports = youtubenotification