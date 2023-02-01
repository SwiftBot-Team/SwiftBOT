const Base = require("../../services/Command");

class twentyfourhours extends Base {
    constructor(client) {
        super(client, {
            name: "24h",
            description: "descriptions:24h",
            category: "categories:music",
            usage: "usages:24h",
            cooldown: 1000,
            aliases: [],
            requiresChannel: true,
            slash: true,
            requiresPlayer: true
        })
    }

    async run({ message, args, prefix, player }, t) {

        player.autoPlay = player.autoPlay ? false : true;

        if (player.autoPlay) {
            player.autoPlayTimeout = setTimeout(() => {
                player.destroy();

                if (!player) return;

                message.channel.send(`Este servidor excedeu o limite de 3 horas usando o modo 24 horas. Ouça músicas 24 horas por dia adquirindo a versão premium do BOT.`)
            }, (60000 * 60 * 3))

            return message.respond(`Modo 24 horas ativado com sucesso.`);
        }

        if (!player.autoPlay) {

            clearTimeout(player.autoPlayTimeout);

            return message.respond(`Modo 24 horas desativado com sucesso.`);
        }


    }
}
module.exports = twentyfourhours