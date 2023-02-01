const Base = require("../../services/Command");

class AutoRole extends Base {
  constructor(client) {
    super(client, {
      name: "autorole",
      cooldown: 1000,
      aliases: ["setautorole", "config-autorole"],
      category: "categories:config",
      description: "descriptions:autorole",
      permissions: ["MANAGE_GUILD"],
      bot_permissions: ["MANAGE_ROLES"]
    });
  }

  async run({ message, args, prefix }, t) {
    if (!args[0]) return message.respond('<:errado:739176302317273089> » ' + t('commands:autorole.use', { prefix }));
    const ref = await this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/autorole`).once('value');


    if (['add', 'adicionar'].includes(args[0].toLowerCase())) {
      if (!args[1]) return message.respond(t('commands:autorole.noArgs1', { member: message.author.id, acao: 'adicionar' }));
      const role = message.guild.roles.cache.get(args[1]) || message.guild.roles.cache.find(r => r.name.toLowerCase() === args[1].toLowerCase()) || message.mentions.roles.first();
      const roles = [];

      if (!role) return message.respond(t('commands:autorole.noFoundRole', { member: message.author.id, role: args[1] }));

      roles.push(role.id)

      if (ref.val() && ref.val().includes(role.id)) return message.respond(t('commands:autorole.exists', { member: message.author.id, role: role.id }));

      if (ref.val()) {
        for (let i = 0; i < ref.val().length; i++) roles.push(ref.val()[i])

      }

      this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/autorole`).set(roles);

      await message.channel.send(new this.client.embed(message.author).setDescription(t('commands:autorole.sucessAdd', { member: message.author.id, role: role.id })))

    }

    if (['remove', 'remover'].includes(args[0].toLowerCase())) {
      if (!args[1]) return message.channel.send(new this.client.embed(message.author).setDescription(t('commands:autorole.noArgs1', { member: message.author.id, acao: 'remover' })));

      const role = message.guild.roles.cache.get(args[1]) || message.guild.roles.cache.find(r => r.name.toLowerCase() === args[1].toLowerCase()) || message.mentions.roles.first();

      if (!role) return message.channel.send(new this.client.embed(message.author).setDescription(t('commands:autorole.noFoundRole', { member: message.author.id, role: args[1] })));
      if (ref.val() && !ref.val().includes(role.id) || !ref.val()) return message.channel.send(new this.client.embed().setDescription(t('commands:autorole.roleNoExists', { member: message.author.id, role: role.id })));
      const array = [];
      for (let i = 0; i < ref.val().length; i++) array.push(ref.val()[i]);

      array.splice(array.indexOf(role.id), 1);

      this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/autorole`).set(array);

      await message.channel.send(new this.client.embed(message.author).setDescription(t('commands:autorole.sucessRemove', { member: message.author.id, role: role.id })))

    }

    if (['status', 'stats'].includes(args[0].toLowerCase())) {
      const db = await this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/config/autorole`).once('value');
      const embed = new this.client.embed(message.author)
        .setAuthor(t('commands:autorole.statusAuthor'), this.client.user.displayAvatarURL())
        .setDescription(`${db.val() ? t('commands:autorole.statusYes') : t('commands:autorole.statusNo')}\n\n ${ref.val() ? t('commands:autorole.statusRolesYes', { roles: ref.val().filter(r => message.guild.roles.cache.get(r)).map(r => message.guild.roles.cache.get(r)).join(', ') }) : t('commands:autorole.statusRolesNo')}`);
      message.channel.send(embed);
    }

    if (['ativate', 'ativar', 'on', 'enable', 'ligar'].includes(args[0].toLowerCase())) {

      if (!message.guild.me.permissions.has('MANAGE_ROLES')) return message.respond(t('commands:autorole.noPerms', { member: message.author.id }));

      const db = await this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/config/autorole`).once('value');
      if (db.val() === 'Ativo') return message.channel.send(new this.client.embed(message.author).setDescription(t('commands:autorole.isAtive', { member: message.author.id })));
      this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/config/autorole`).set('Ativo');
      message.channel.send(new this.client.embed(message.author).setDescription(t('commands:autorole.sucessActived', { member: message.author.id })))
    }

    if (['desabilitar', 'desativar', 'disable', 'desligar'].includes(args[0].toLowerCase())) {
      const db = await this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/config/autorole`).once('value');
      if (db.val() === 'desativado') return message.channel.send(new this.client.embed(message.author).setDescription(t('commands:autorole.isDisabled', { member: message.author.id })));
      this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/config/autorole`).set('desativado');
      message.channel.send(new this.client.embed(message.author).setDescription(t('commands:autorole.sucessDisabled', { member: message.author.id })))
    }

  }
}

module.exports = AutoRole;