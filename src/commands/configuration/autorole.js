const Base = require("../../services/Command");

class AutoRole extends Base {
  constructor(client) {
    super(client, {
      name: "autorole",
      cooldown: 1000,
      aliases: ["setautorole", "config-autorole"],
      category: "categories:config",
      description: "descriptions:autorole",
      permissions: ["MANAGE_SERVER"],
      bot_permission: ["MANAGE_ROLES"]
    });
  }

  async run({ message, args, prefix }, t) {
    if (!args[0]) return this.respond('<:errado:739176302317273089> » ' + t('commands:autorole.use', { prefix }));
    const ref = await this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/autorole`).once('value');
    const role = message.guild.roles.cache.get(args[1]) || message.guild.roles.cache.find(r => r.name === args[1]) || message.mentions.roles.first();

    if (['add', 'adicionar'].includes(args[0].toLowerCase())) {
      if (!args[1]) return this.respond(t('commands:autorole.noArgs1', { member: message.author.id, acao: 'adicionar' }));
      const roles = [];

      if (!role) return this.respond(t('commands:autorole.noFoundRole', { member: message.author.id, role: args[1] }));

      roles.push(role.id)

      if (ref.val() && ref.val().includes(role.id)) return this.respond(t('commands:autorole.exists', { member: message.author.id, role: role.id }));

      if (ref.val()) {
        for (let i = 0; i < ref.val().length; i++) roles.push(ref.val()[i])

      }

      this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/autorole`).set(roles);

      await message.channel.send(new this.client.embed(message.author).setDescription(t('commands:autorole.sucessAdd', { member: message.author.id, role: role.id })))

    }

    if (['remove', 'remover'].includes(args[0].toLowerCase())) {
      if (!args[1]) return message.channel.send(new this.client.embed(message.author).setDescription(t('commands:autorole.noArgs1', { member: message.author.id, acao: 'remover' })));

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
        .setAuthor("Swift - Status do Autorole", this.client.user.displayAvatarURL())
        .setDescription(`Status do autorole: ${db.val() || "Desligado"} \n\n ${ref.val() ? `Cargos no autorole: ${ref.val().filter(r => message.guild.roles.cache.get(r)).map(r => message.guild.roles.cache.get(r)).join(', ')}` : `Cargos: Nenhum`}`);
      message.channel.send(embed);
    }

    if (['ativate', 'ativar', 'on', 'enable'].includes(args[0].toLowerCase())) {
      const db = await this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/config/autorole`).once('value');
      if (db.val() === 'ativo') return message.channel.send(new this.client.embed(message.author).setDescription(t('commands:autorole.isAtive', { member: message.author.id })));
      this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/config/autorole`).set('ativo');
      message.channel.send(new this.client.embed(message.author).setDescription(t('commands:autorole.sucessActived', { member: message.author.id })))
    }

    if (['desabilitar', 'desativar', 'disable'].includes(args[0].toLowerCase())) {
      const db = await this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/config/autorole`).once('value');
      if (db.val() === 'desativado') return message.channel.send(new this.client.embed(message.author).setDescription(t('commands:autorole.isDisabled', { member: message.author.id })));
      this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/config/autorole`).set('desativado');
      message.channel.send(new this.client.embed(message.author).setDescription(t('commands:autorole.sucessDisabled', { member: message.author.id })))
    }

  }
}

module.exports = AutoRole;