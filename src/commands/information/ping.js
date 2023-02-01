const Base = require("../../services/Command");

class Ping extends Base {
    constructor(client) {
        super(client, {
            name: "ping",
            description: "descriptions:ping",
            category: "categories:info",
            cooldown: 10000,
            aliases: ["pong", "ms"]
        });
    }

    async run({ message, args, prefix }, t) {
        
        const startMsg = process.hrtime();
        const msg = await message.respond('Calculando latência...');
        
        const stopMsg = process.hrtime(startMsg);

        const startDB = process.hrtime();
        await this.client.database.ref('Ping').once('value');
        const stopDB = process.hrtime(startDB);

        const pingMsg = Math.round(((stopMsg[0] * 1e9) + stopMsg[1]) / 1e6);
        const pingDB = Math.round(((stopDB[0] * 1e9) + stopDB[1]) / 1e6);
        
        const pingLavalink = this.client.musicHeartbeat.first()?.ping || 0;
        
        const pingAPI = this.client.ws.ping;
        
        const embed = new this.client.embed(message.author)
            .setTitle('Swift | Ping')
            .setDescriptionFromBlockArray([
                [
                    `:ping_pong: ${Math.floor(pingAPI)}ms`,
                    `🤖 ${Math.floor(pingMsg)}ms`,
                    `<:Aqfirebase:926626978633744404> ${Math.floor(pingDB)}ms`,
                    `<:lavalink:836636573726146671> ${Math.floor(pingLavalink)}ms`
                ]
            ])

        msg.edit({ embed })
    }
}

module.exports = Ping;
