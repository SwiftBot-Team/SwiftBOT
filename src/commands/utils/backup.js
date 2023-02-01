const { Command } = require('../../index');

const moment = require('moment');

moment.locale('pt-');

module.exports = class Render extends Command {
    constructor(client) {
        super(client, {
            name: "backup",
            description: "descriptions:backup",
            category: "categories:utils",
            usage: "usages:render",
            cooldown: 3000,
            aliases: [],
            bot_permissions: ['MANAGE_CHANNELS', 'MANAGE_GUILD', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS', 'MANAGE_EMOJIS', 'MANAGE_NICKNAMES', 'BAN_MEMBERS'],
            permissions: ['ADMINISTRATOR']
        })
    }

    async run({ message, args, prefix, member }, t) {

        if (!args[0]) return message.respond(t('commands:backup.noOption', { member, prefix }));

        if (['create', 'criar'].includes(args[0].toLowerCase())) {

            const verify = this.client.controllers.backup.createCooldown.get(message.author.id);

            if (verify) return message.respond(t('commands:backup:create.inCooldown', { member, time: this.client.msToTime(verify - Date.now()) }));

            this.client.controllers.backup.createCooldown.set(message.author.id, Date.now() + 60000 * 5);

            setTimeout(() => this.client.controllers.backup.createCooldown.delete(message.author.id), 60000 * 5);

            const backup = await this.client.controllers.backup.create(message.guild, message.author.id);

            return message.respond(t('commands:backup:create.sucess', { id: backup.id, prefix, member }))
        }

        if (['load', 'carregar'].includes(args[0].toLowerCase())) {

            const verify = this.client.controllers.backup.loadCooldown.get(message.author.id);

            if (verify) return message.respond(t('commands:backup:load.inCooldown', { member, time: this.client.msToTime(verify - Date.now()) }));
            
            const myRole = message.guild.me.roles.highest
            
            if(!myRole || message.guild.roles.cache.size === 0 || message.guild.roles.highest.id !== myRole.id) return message.respond(`Para que eu possa carregar backups, é necessário que meu cargo seja o maior cargo no servidor.`);

            if (!args[1]) return message.respond(t('commands:backup:load.noArgs1', { member }));

            if (!await this.client.controllers.backup.get(message.author.id, args[1])) return message.respond(t('commands:backup:load.noFound', { member, prefix }));
            
            const confirm = await message.respond(`Você tem certeza que deseja carrgar o backup? Tudo será deletado (canais, cargos, etc..)`);
            
            await confirm.react('✅');
            await confirm.react('❌');
            
            confirm.createReactionCollector((r, u) => ['✅', '❌'].includes(r.emoji.name) && u.id === message.author.id, { max: 1, time: 30000 })
            
            .on('collect', async ({ emoji }) => {
                if(emoji.name === '❌') return message.respond('Operação cancelada com sucesso.');
                
                this.client.controllers.backup.loadCooldown.set(message.author.id, Date.now() + 60000 * 5);
                
                setTimeout(() => this.client.controllers.backup.loadCooldown.delete(message.author.id), 60000 * 5);
                
                const backup = await this.client.controllers.backup.load(message.guild, message.author.id, args[1]);
                
                message.guild.channels.cache.filter(c => c.type === 'text').random().send(t('commands:backup:load.sucess'));
                
            })
            
            .on('end', async (_, reason) => {
                if(reason !== 'limit') return message.quote('Você demorou demais para responder.');
            })
        }

        if (['listar', 'list'].includes(args[0].toLowerCase())) {
            const backups = await this.client.controllers.backup.getAll(message.author.id);

            if (!backups.length) return message.respond(t('commands:backup:list.noBackups', { member, prefix }));

            const embed = new this.client.embed()
                .setAuthor(t('commands:backup:list.autor'), this.client.user.displayAvatarURL())
                .setDescription(backups.sort((a, b) => b[1].date - a[1].date).map((backup, i) => {
                    const created = moment(backup[1].date).format('LLL');

                    return `\`${i + 1}\` - **${backup[1].name}** - \`${created}\` - \`(${backup[0]})\``
                }).join('\n'));

            message.channel.send(embed)
        }
    }
}
