const Base = require("../../services/Command");

class Ping extends Base {
    constructor(client) {
        super(client, {
            name: "ping",
            description: "descriptions:ping",
            category: "categories:info",
            cooldown: 1000,
            aliases: ["pong", "ms"]
        });
    }

    run({ message, args, prefix }, t) {
        const embed = new this.client.embed(message.author)
            .setTitle('Swift | Ping')
            .setDescriptionFromBlockArray([
                [
                    `:ping_pong: ${Math.floor(this.client.ws.ping)}ms`
                ]
            ])

        message.channel.send(embed)
    }
}

module.exports = Ping;