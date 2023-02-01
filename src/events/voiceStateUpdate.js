module.exports = class {
    constructor(client) {
        this.client = client;
        this.name = 'voiceStateUpdate'
    }
    async run(oldState, newState) {

        const player = this.client.music.players.get(newState.guild.id);

        const record = this.client.records.get(newState.guild.id);

        const tts = this.client.tts.get(newState.guild.id);

        const t = await this.client.getTranslate(newState.guild.id);

        if (!newState.channelID && newState.member && newState.member.id === this.client.user.id) {

            if (player) {
                player.destroy(oldState.guild.id);

                return this.client.channels.cache.get(player.textChannel).send(new this.client.embed().setDescription(t('utils:music:voiceStateUpdate.removed')));
            }

            if (record && !record.ended) {

                record.streams.array().map(s => s.end());

                this.client.records.delete(newState.guild.id);

                return record.channel.send(`Fui removido do canal e por isso a gravação foi cancelada.`);
            }

            if (tts) {
                return this.client.tts.delete(newState.guild.id);
            }

        }

        if (player && oldState.channelID && oldState.channelID === player.voiceChannel && (newState.channelID ? newState.channelID !== oldState.channelID : true)) {

            if (oldState.channel.members.filter(c => !c.user.bot).size === 0) {
                player.pause(true);

                const msg = await this.client.channels.cache.get(player.textChannel).send(new this.client.embed()
                    .setDescription(t('utils:music:voiceStateUpdate.2minutos')));

                player.voiceStateMessage = msg;

                setTimeout(() => {
                    if (!this.client.music.players.get(oldState.guild.id)) return;

                    msg.delete({ timeout: 60000 * 2 }).catch(err => err)

                    if (oldState.channel?.members.filter(c => !c.user.bot).size > 0) return;

                    player.destroy();

                    return this.client.channels.cache.get(player.textChannel).send(t('utils:music:voiceStateUpdate.2minutosEnd'))
                }, 2 * 60000);
            }
        } else if (newState.channel && newState.channel.members.filter(c => !c.user.bot).size === 1 && player && player.voiceChannel === newState.channelID) {

            player.pause(false);

            if (player.voiceStateMessage) player.voiceStateMessage.delete({ timeout: 0 }).catch(err => err);
        }

    }
}