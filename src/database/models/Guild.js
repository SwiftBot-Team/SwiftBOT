const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    guildID: String,
    guildName: String,
    ownerID: String,
    ownerUsername: String,
    prefix: String,
    lang: String,
    config: {
        deleteMessage: Boolean,
        forbiddenChannelMsg: Boolean,
        cmdChannels: Array,
        setAdmin: Boolean,
        setMod: Boolean,
        autoRole: {
            enabled: Boolean,
            roles: Array
        },
        messages: {
            enabled: Boolean,
            welcome: {
                enabled: Boolean,
                channel: String,
                message: String
            },
            leave: {
                enabled: Boolean,
                channel: String,
                message: String
            }
        },
        antiInvite: {
            enabled: Boolean,
            allowedChannels: Array,
            allowGuildInvites: Boolean,
            deleteInvite: Boolean,
            sendMessage: Boolean,
            blockMessage: String,
        }
    },
    role: {
        modRole: String,
        adminRole: String,
        mutedRole: {
            enabled: false,
            roleID: String
        }
    },
    channel: {
        punishChannel: {
            enabled: false,
            channelID: String
        }
    }
});

module.exports = mongoose.model('Guild', guildSchema);
