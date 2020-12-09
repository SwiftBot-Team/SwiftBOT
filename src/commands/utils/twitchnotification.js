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

        if (!args[0]) return this.respond(t('commands:twitchnotification.noArgs', { member }));

        const db = await this.client.database.ref(`SwiftBOT/twitchnotification/${message.guild.id}`).once('value');

        if (['add', 'adicionar'].includes(args[0].toLowerCase())) {
            if (db.val() && db.val().length > 3) return this.respond(t('commands:twitchnotification:add.maxChannels', { member }));

            const url = args[1];

            if (!url) return this.respond(t('commands:youtunenotification:add.noUrl', { member, prefix }));

            const verify = await Twitch.validateUser(url).catch(err => this.respond(t('commands:twitchnotification:add.channelError', { member })));

            if (!verify.data.length) return this.respond(t('commands:twitchnotification:add.channelError', { member }));

            const verifyArray = this.client.streamers.find(c => c.id === verify.data[0].login);

            if (verifyArray) return this.respond(t('commands:twitchnotification:add.exists', { member }));

            if (!args[2]) return this.respond(t('commands:twitchnotification:add.noTextChannel', { member, prefix }))

            const textChannel = message.mentions.channels.first() || message.guild.channels.cache.get(args[2]);

            if (!textChannel || textChannel.type !== 'text') return this.respond(t('commands:twitchnotification:add.textChannelError', { member }));

            const toAdd = db.val() ? [...db.val(), { id: verify.data[0].login, textChannel: textChannel.id, guild: message.guild.id, status: false, position: db.val().length }] : [{ id: verify.data[0].login, textChannel: textChannel.id, guild: message.guild.id, status: false, position: db.val() ? db.val().length : 0 }];

            this.respond(t('commands:twitchnotification:add.sucess', { member }));

            this.client.database.ref(`SwiftBOT/twitchnotification/${message.guild.id}`).set(toAdd);

            this.client.streamers.push({ id: verify.data[0].login, textChannel: textChannel.id, guild: message.guild.id });

        }

        if (['remove', 'remover', 'rem'].includes(args[0].toLowerCase())) {
            if (!args[1]) return this.respond(t('commands:twitchnotification:remove.noArgs1', { member }));

            if (!db.val()) return this.respond(t('commands:twitchnotification:remove.noHas', { member }));

            const video = await Twitch.validateUser(args[1]).catch(err => this.respond(t('commands:twitchnotification:remove.channelError', { member })));

            if (!video) return this.respond(t('comands:twitchnotification:remove.channelError', { member }));

            const verify = db.val().find(c => c.id === video.data[0].login);

            if (!verify.length) return this.respond(t('commands:twitchnotification:remove.noHas', { member }));

            this.client.streamers.splice(this.client.streamers.indexOf(this.client.streamers.find(c => c.id === verify.data[0].login && c.textChannel === verify.textChannel)), 1)

            const newArray = [...this.client.streamers];

            this.client.database.ref(`SwiftBOT/twitchnotification/${message.guild.id}`).set(newArray);

            return this.respond(t('commands:twitchnotification:remove.sucess', { member }));
        }
    }
}
module.exports = twitchnotification