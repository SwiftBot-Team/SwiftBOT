const Base = require("../../services/Command");

class emojiInfo extends Base {
    constructor(client) {
        super(client, {
            name: "emojiinfo",
            description: "descriptions:emojiinfo",
            category: "categories:utils",
            usage: "usages:emojiinfo",
            cooldown: 3000,
            aliases: [],
            permissions: [],
            bot_permissions: []
        });
    }

    async run({ message, args, prefix }, t) {

        const emoji = message.emojis.first()

        if (!emoji) return message.respond('Emoji inválido!');

        const embed = new this.client.embed()
            .setAuthor(emoji.name, emoji.url)
            .addFields([
                {
                    name: '🔖 Nome',
                    value: emoji.name,
                    inline: true
                },
                {
                    name: '👀 Menção',
                    value: `\`${emoji.toString()}\``,
                    inline: true
                },
                {
                    name: '⛓️ Link',
                    value: emoji.url,
                    inline: true
                }
            ]);

        if (emoji.id) embed.addField('🆔 Id', `\`${emoji.id}\` `, true);
        
        if(emoji.animated) embed.addField('😀 Animado', 'Sim', true)

        return message.respond(embed);


    }
}

module.exports = emojiInfo;
