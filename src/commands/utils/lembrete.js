const Base = require("../../services/Command");

const moment = require('moment');

moment.locale('pt-br');

const ms = require('ms');
const { TrackUtils } = require("erela.js");

module.exports = class Lembrete extends Base {
    constructor(client) {
        super(client, {
            name: 'lembrete',
            aliases: ['remind'],
            cooldown: 1000,
			category: "categories:utils",
        })
    }

    async run({ message, args, member, prefix }, t) {
        if (!args[0]) return message.respond(t('commands:lembrete.noArgs0', { member, prefix }));

        if (!['create', 'criar', 'delete', 'deletar', 'list', 'listar'].some(o => args[0].toLowerCase() === o)) return message.respond(t('commands:lembrete.invalidOption', { member, prefix }));

        const myLembretes = await this.client.database.ref(`SwiftBOT/lembretes/${message.author.id}`).once('value').then(d => d.val() || []);

        if (['create', 'criar'].includes(args[0].toLowerCase())) {

            if (myLembretes.length > 5) return message.respond(t('commands:lembrete.limiteLembretes', { member, prefix }));

            if (!args[1]) return message.respond(t('commands:lembrete.noArgs1', { member, prefix }));

            const name = args.slice(1).join(" ");

            if (name.length > 100) return message.respond(t('commands:lembrete.limiteChar', { member, prefix }));

            const send = await message.respond(t('commands:lembrete.timeEmbed', { member, prefix }), true, {
                footer: t('utils:operationCancel')
            });

            const collector = send.channel.createMessageCollector(m => m.author.id === message.author.id, { time: 60000 })

                .on('collect', async ({ content }) => {

                    if (['cancel', 'cancelar'].includes(content)) {
                        message.respond(t('utils:operationCanceled'));

                        return collector.stop('user');
                    }

                    const time = ms(content) || this.getMs(content);

                    if (!time) return message.respond(t('commands:lembrete.noValidTime', { member, prefix }), true, {
                        footer: t('utils:operationCancel')
                    });

                    if (time < 0) return message.respond(t('commands:lembrete.noValidTime', { member, prefix }), true, {
                        footer: t('utils:operationCancel')
                    });

                    message.respond(t('commands:lembrete.sucessCreate', { member }));

                    collector.stop('user');

                    myLembretes.push({
                        name: name,
                        time: Date.now() + time,
                        channel: message.channel.id
                    });

                    this.client.database.ref(`SwiftBOT/lembretes/${message.author.id}`).set(myLembretes);

                    setTimeout(async () => {
                        message.channel.send(`${message.member}`,
                            new this.client.embed(message.author)
                                .setAuthor('Lembrete!', this.client.user.displayAvatarURL())
                                .setDescription(name));

                        const newRef = await this.client.database.ref(`SwiftBOT/lembretes/${message.author.id}`).once('value').then(d => d.val());

                        newRef.splice(newRef.indexOf(newRef.find(l => l.name === name)), 1);

                        this.client.database.ref(`SwiftBOT/lembretes/${message.author.id}`).set(newRef);

                    }, time)
                })
        }

        if (['list', 'listar'].includes(args[0].toLowerCase())) {
            if (!myLembretes.length) return message.respond(t('commands:lembrete.noLembretes', { member, prefix }));

            return message.respond(`${myLembretes.sort((a, b) => a.time - b.time).map((l, i) => `**${i + 1} - ${l.name}** - \`Finaliza em: ${moment(l.time - (60000 * 60 * 3)).format('LLL')}\` `).join("\n")} `, {
                author: {
                    text: t('commands:lembrete.embedAuthor'),
                    image: this.client.user.displayAvatarURL()
                }
            })
        }

        // if (['deletar', 'delete', 'excluir'].includes(args[0].toLowerCase())) {
        //     if (!args[1]) return message.respond(t('commands:lembrete.noArgs1', { member, prefix }));

        //     const name = args.slice(1).join(" ");

        //     if (!myLembretes.find(l => l.name === name)) return message.respond(t('commands:lembrete.noFound', { member, prefix }));

        //     myLembretes.splice(myLembretes.indexOf(myLembretes.find(l => l.name === name)), 1);

        //     this.client.database.ref(`SwiftBOT/lembretes/${message.author.id}`).set(myLembretes);


        // }
    }
}