const Command = require('../../services/Command')
const ShipImg = require('../../services/Images')
const Discord = require('discord.js')

class Ship extends Command {
  constructor(client) {
    super(client, {
      name: 'ship',
      aliases: ['shippar', 'love', 'amor'],
      description: "descriptions:ship",
      category: "categories:fun"
    })
  }


  async run({ message, args, prefix }, t) {

    let user1;
    let user2;

    if (!args[1]) user1 = message.member;

    if (!args[0]) return this.respond(t('commands:ship.noArgs'));

    if (args[1]) user1 = message.mentions.members ? message.mentions.members.first() : message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(member => member.nickname === args[0]) || message.guild.members.cache.find(member => member.user.username === args[0]);

    if (!args[1]) user2 = message.mentions.members ? message.mentions.members.first() : message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(member => member.nickname === args[0]) || message.guild.members.cache.find(member => member.user.username === args[0]);

    if (args[1]) user2 = message.mentions.members.first(2)[1] ? message.mentions.members.first(2)[1] : message.guild.members.cache.get(args[1]) || message.guild.members.cache.find(member => member.nickname === args[1]) || message.guild.members.cache.find(member => member.user.username === args[1]);

    if (!user1) return this.respond(t('commands:ship.noUserFound', { user: args[0] }));
    if (!user2) return this.respond(t('commands:ship.noUserFound', { user: args[1] ? args[1] : args[0] }));

    const probabilidades = {
      5: '',
      10: '[█---------]',
      25: '[██--------]',
      35: '[███-------]',
      50: '[█████-----]',
      70: '[███████---]',
      80: '[████████--]',
      100: '[██████████]'
    };

    // const users = {
    //   1: args[1] ? message.mentions.members ? message.mentions.members.first() : message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(member => member.nickname === args[0]) || message.guild.members.cache.find(member => member.user.username === args[0]) : message.member,
    //   2: args[1] ? message.mentions.members.first(2)[1] ? message.mentions.members.first(2)[1] : message.guild.members.cache.get(args[1])|| message.guild.members.cache.find(member => member.nickname === args[1]) || message.guild.members.cache.find(member => member.user.username === args[1]) : message.mentions.members ? message.mentions.members.first() : message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(member => member.nickname === args[0]) || message.guild.members.cache.find(member => member.user.username === args[0])
    // }

    const ref = await this.client.database.ref(`SwiftBOT/ship/users/${user1.user.id}/${user2.user.id}`).once('value');

    const chance = ref.val() ? ref.val() : (Number(`${user1.id.slice(-3)}`) + Number(`${user2.id.slice(-3)}`)) % 101;

    const probability = [5, 10, 25, 35, 50, 70, 80, 100];

    const porcentagem = probability.reduce((prev, next) => Math.abs(next - chance) < Math.abs(prev - chance) ? next : prev);

    const img = await new ShipImg().loadShip2(user1, user2, chance)

    this.respond(`${chance}% - ${probabilidades[porcentagem]}`)

    message.channel.send(new Discord.MessageAttachment(img))
  }
}

module.exports = Ship;