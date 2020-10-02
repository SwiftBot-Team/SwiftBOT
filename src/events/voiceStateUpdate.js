module.exports = class {
    constructor(client) {
        this.client = client;
    }
    async run(oldState, newState) {
        if (newState.member.user.id !== this.client.user.id) return;
        if (!newState.channelID) {

            const player = this.client.music.players.get(newState.guild.id);
            if (player) {
                const t = await this.client.getTranslate(player.guild);

                this.client.music.leave(newState.guild.id);

                player.textChannel.send(new this.client.embed().setDescription(t('utils:music.voiceStateUpdate')));
            }

        } else {
            await newState.guild.me.voice.setSelfDeaf(true);
        }
    }
}