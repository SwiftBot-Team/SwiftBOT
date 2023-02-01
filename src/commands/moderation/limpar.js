const Command = require("../../services/Command");

module.exports = class Limpar extends Command {
    constructor(client) {
        super(client, {
            name: "limpar",
            cooldown: 5000,
            category: 'categories:mod',
            aliases: ["clear", 'clear-chat', 'limpar-chat'],
            permissions: ['MANAGE_MESSAGES'],
            bot_permissions: ['MANAGE_MESSAGES']
        });
    }

    async run({ message, args, prefix, player, games }, t) {

        if (!args[0]) return message.respond(t('commands:limpar.noArgs', { member: message.author.id }));

        const amount = Number(args[0]);

        if (amount > 1000 || amount < 2) return message.respond(t('commands:limpar.invalidAmount', { member: message.author.di }))

        const pages = Math.ceil(amount / 100);

        console.log(pages)

        if (pages === 1) {
            let messages = await message.channel.messages.fetch({ limit: amount });

            messages = messages.array().filter(m => m.pinned === false);

            const deleted = await message.channel.bulkDelete(messages, true);

            message.respond(`${deleted.size < messages.length ? t('commands:limpar.sucess2', { memberTag: message.author.tag, fail: messages.length - deleted.size }) : t('commands:limpar.sucess', { memberTag: message.author.tag })}`)
        }

        else {

            let length = 0;

            for (let i = 0; i < pages; i++) {

                let messages = await message.channel.messages.fetch({ limit: i === pages.length - 1 ? amount - ((pages - 1) * 100) : 100 });

                messages = messages.array().filter(m => m.pinned === false);

                const deleted = await message.channel.bulkDelete(messages, true);

                length += deleted.size;

                if (deleted.size < messages.length) continue;
            }

            await message.respond(`${length < amount ? t('commands:limpar.sucess2', { memberTag: message.author.tag, fail: amount - length }) : t('commands:limpar.sucess', { memberTag: message.author.tag })}`)
        }


    }
}