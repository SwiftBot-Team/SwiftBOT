module.exports = class {
    constructor(client) {
        this.client = client;
    }
    async run(channel) {

        if (!this.client.controllers) return;

        const verify = this.client.controllers.atendimentos.get(channel.guild.id);

        if (!verify) return;

        const channelInfo = verify.abertos.find(c => c.channel === channel.id);

        if (!channelInfo) return;

        this.client.controllers.atendimentos.delete(channelInfo.id, channel.guild.id)
    }
}