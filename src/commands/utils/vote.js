const Base = require("../../services/Command");

class Vote extends Base {
    constructor(client) {
        super(client, {
            name: "vote",
            description: "descriptions:vote",
            category: "categories:utils",
            usage: "usages:vote",
            cooldown: 1000,
            aliases: ["votar"]
        })
    }

    async run({ message, args, prefix }, t) {

        message.respond(`https://top.gg/bot/577139966379819044/vote`)
    }
}
module.exports = Vote;