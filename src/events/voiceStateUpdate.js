module.exports = class {
    constructor(client) {
        this.client = client;
    }
    async run(oldState, newState) {

        const player = this.client.music.players.get(newState.guild.id);

        const t = await this.client.getTranslate(newState.guild.id);

        if (!newState.channelID && newState.member.user.id === this.client.user.id) {

            if (player) {

                player.destroy(oldState.guild.id)

                return this.client.channels.cache.get(player.textChannel).send(new this.client.embed().setDescription(t('utils:music.voiceStateUpdate')));
            }

        }

        if (!newState.channelID && newState.member.user.id !== this.client.user.id && player && player.voiceChannel === oldState.channelID) {


            if (oldState.channel.members.filter(c => !c.user.bot).size === 0) {
                player.pause(true);

                this.client.channels.cache.get(player.textChannel).send(new this.client.embed()
                    .setDescription(t('utils:music:voiceStateUpdate.2minutos'))).then(msg => msg.delete({ timeout: 60000 * 2 }))

                setTimeout(() => {
                    if (!player) return;

                    if (oldState.channel.members.filter(c => !c.user.bot).size > 0) return;

                    player.destroy();

                    return this.client.channels.cache.get(player.textChannel).send(t('utils:music:voiceStateUpdate.2minutosEnd'))
                }, 2 * 60000);
            }
        } else if (newState.channel && newState.channel.members.filter(c => !c.user.bot).size === 1 && player && player.voiceChannel === newState.channelID) {

            player.pause(false);
        }

    }
}