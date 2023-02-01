const Guild = require('../../database/models/Guild')

module.exports = class AntiInvite {
    constructor(client) {
        this.client = client
    }

    async run() {
        this.client.on('message', async (message) => {
            if (message.channel.type === 'dm') return;
            if (message.guild.id === '729715039413469345' || message.guild.id === "425864977996578816" || message.guild.id === '584456795259535379') return;

            // if (message.guild.id === '747420727908630658' || message.guild.id === '729715039413469345') return
            let t = await this.client.getTranslate(message.guild.id);

            const db = await this.client.database.ref(`SwiftBOT/servidores/${message.guild.id}/config`).once('value');

            if (!db.val() || !db.val().autoMod) return;

            const args = message.content.split(" ");

            let maxFlood = Math.ceil(args.length / 2);
            let nowFlood = 0;

            for (let i = 0; i < args.length; i++) {
                if (!args[i + 1] || !args[i + 1 + 1]) continue;

                if (args[i] === args[i + 1] && args[i] === args[i + 1 + 1]) nowFlood++;
                if (nowFlood >= maxFlood) {
                    return message.channel.send(new this.client.embed()
                        .setDescription('sem flood mano mds k'))
                }
            }

            let amount = 0;
            
            let oldChar = args[0].split('')[0];

            for (const s in message.content.split('')) {
                if (message.content.split('')[s] === ' ') continue;

                if (message.content.split('')[s] == oldChar) {
                    amount++;
                } else {
                    oldChar = message.content.split('')[s];
                    amount = 1;
                }

                if (amount >= 5) {
                    return message.channel.send('para de spam mano')
                }
            }
        })
    }
}