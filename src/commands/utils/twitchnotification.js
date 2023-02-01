const Command = require("../../services/Command");

class twitchnotification extends Command {
    constructor(client) {
        super(client, {
            name: "twitchnotification",
            description: "descriptions:twitchnotification",
            category: "categories:utils",
            cooldown: 1000,
            aliases: [],
            permissions: ['MANAGE_GUILD']
        })
    }

    async run({ message, args, prefix, member }, t) {

        const Twitch = this.client.twitch;

        if (!args[0]) return message.respond(t('commands:twitchnotification.noArgs', { member }));

        const db = this.client.streamers.map((value, streamer) => ({ streamer, value })).filter(streamer => streamer.value.find(v => v.guild === message.guild.id))

        if (['add', 'adicionar'].includes(args[0].toLowerCase())) {
            if (db.length > 3) return message.respond(t('commands:twitchnotification:add.maxChannels', { member }));

            const url = args[1];

            if (!url) return message.respond(t('commands:twitchnotification:add.noUrl', { member, prefix }));

            const verify = await Twitch.validateUser(url).catch(err => message.respond(t('commands:twitchnotification:add.channelError', { member })));

            if (!verify || !verify.data.length) return message.respond(t('commands:twitchnotification:add.channelError', { member }));

            const verifyArray = db.find(c => c.streamer === verify.data[0].login);

            if (verifyArray) return message.respond(t('commands:twitchnotification:add.exists', { member }));

            if (!args[2]) return message.respond(t('commands:twitchnotification:add.noTextChannel', { member, prefix }))

            const textChannel = message.mentions.channels.first() || message.guild.channels.cache.get(args[2]);

            if (!textChannel || textChannel.type !== 'text') return message.respond(t('commands:twitchnotification:add.textChannelError', { member }));

            this.client.streamers.get(verify.data[0].login)?.push({ guild: message.guild.id, textChannel: textChannel.id, status: false })
                || this.client.streamers.set(verify.data[0].login, [{
                    guild: message.guild.id,
                    textChannel: textChannel.id,
                    status: false
                }]);

            message.respond(t('commands:twitchnotification:add.sucess', { member }));

            this.client.database.ref(`SwiftBOT/twitchnotification/${verify.data[0].login}`).set(this.client.streamers.get(verify.data[0].login));
        }

        if (['remove', 'remover', 'rem'].includes(args[0].toLowerCase())) {
            if (!args[1]) return message.respond(t('commands:twitchnotification:remove.noArgs1', { member }));

            if (!db.length) return message.respond(t('commands:twitchnotification:remove.noHas', { member }));

            const video = await Twitch.validateUser(args[1]).catch(err => message.respond(t('commands:twitchnotification:remove.channelError', { member })));

            if (!video) return message.respond(t('comands:twitchnotification:remove.channelError', { member }));

            const verify = db.find(c => c.streamer === video.data[0].login);

            if (!verify) return message.respond(t('commands:twitchnotification:remove.noHas', { member }));

            this.client.streamers.get(video.data[0].login).splice(this.client.streamers.get(video.data[0].login).findIndex(g => g.guild === message.guild.id), 1)

            this.client.database.ref(`SwiftBOT/twitchnotification/${video.data[0].login}`).set(this.client.streamers.get(video.data[0].login));

            return message.respond(t('commands:twitchnotification:remove.sucess', { member }));
        }
    }
}
module.exports = twitchnotification