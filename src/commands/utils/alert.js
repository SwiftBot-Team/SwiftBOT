const Base = require("../../services/Command");

class Alert extends Base {
  constructor(client) {
    super(client, {
      name: "alert",
      description: "descriptions:alert",
      category: "categories:utils",
      usage: "usages:alert",
      cooldown: 1000,
      aliases: ["anunciar", "broadcast", "anuncio"],
      permissions: ['MANAGE_GUILD']
    });

    this.options = {}
  }

  async run({ message, args, prefix }, t) {
    message.delete().catch();

    let splitarg = args.join(" ").split(" | ");
    let titulo = splitarg[0];
    let anuncio = splitarg[1];

    if (!titulo) {
      message.channel.send(new this.client.embed(message.author).setDescription(t('commands:anunciar.arg1')));
      return;
    }

    if (!anuncio) {
      message.channel.send(new this.client.embed(message.author).setDescription(t('commands:anunciar.arg2')));
      return;
    }

    const Embed = new this.client.embed(message.author)

    Embed
      .setTitle(t('commands:anunciar.title'))
      .setDescription(
        '⠀'
        + '\n<:module:744210050448490576> **»** '+t('commands:anunciar.options')
        + '\n<:swiftLove:754841489510629477> **»** '+t('commands:anunciar.preview')
        + '\n<a:certo:739210631441547296> **»** '+t('commands:anunciar.final')
        + '\n<:errado:739176302317273089> **»** '+t('commands:anunciar.cancel')
      )
      .setImage('https://images-ext-2.discordapp.net/external/DEVVP8JnNanBG1jmuqau--bJYdHfTdvNGpygemqeRt0/%3Fv%3D1/https/cdn.discordapp.com/emojis/758833296216948776.png')

    let msg = await message.channel.send(Embed)

    let emojis = ['744210050448490576', '754841489510629477', '739210631441547296', '739176302317273089']
    emojis.map(e => msg.react(e))

    const collector = msg.createReactionCollector((r, u) => emojis.includes(r.emoji.id) && u.id === message.author.id, { time: 60000 });

    let anuncioembed = new this.client.embed(message.author)
      .setTitle(`<:Voz:758834154380722186> ${titulo}`)
      .setDescription(`${anuncio}`)
      .setColor('#36393f')
      .setTimestamp()

    collector.on('collect', async (r, u) => {
      r.users.remove(message.author.id);

      switch (r.emoji.id) {
        case '744210050448490576':
          let mention = this.options['everyone'] === 0 ? '@everyone' : (this.options['everyone'] === 1 ? '@here' : t('commands:anunciar.mentionNone'))

          const OptionsEmbed = new this.client.embed(message.author)
            .setThumbnail('https://cdn.discordapp.com/emojis/754827711272321035.png?v=1')
            .setTitle(t('commands:anunciar.optionsTitle'))
            .setDescription(
              `${t('commands:anunciar.mention')} \`${mention}\``
            )


          const sendMessage = await message.channel.send(OptionsEmbed)

          const emojis = ['🔁', '↩️']
          emojis.map(e => {
            sendMessage.react(e)
          })
          
          const changeCollector = sendMessage.createReactionCollector((r, u) => (emojis.includes(r.emoji.name)) && u.id === message.author.id, { time: 30000 });

          changeCollector.on('end', () => {
            if (changeCollector.endReason() === 'limit') return;
      
            sendMessage ? sendMessage.delete({ timeout: 100 }) : null
            this.respond(t('commands:anunciar.end-2'))
          })

          changeCollector.on('collect', async (r, u) => {
            r.users.remove(message.author.id);

            if (r.emoji.name === '🔁') {

              if (mention === '@everyone') mention = '@here'
              else if (mention === '@here') mention = t('commands:anunciar.mentionNone')
              else if (mention === t('commands:anunciar.mentionNone')) mention = '@everyone'

              mention === '@everyone' ? this.options['everyone'] = 0 : (mention === '@here' ? this.options['everyone'] = 1 : this.options['everyone'] = 2)

              OptionsEmbed
                .setDescription(
                  `${t('commands:anunciar.mention')} \`${mention}\``
                )

              sendMessage.edit(OptionsEmbed)
              //sendMessage.reactions.cache.forEach(reaction => reaction.remove(this.client.user.id))
            }
          })

          break;


        case '754841489510629477':
          const mentionMessage = await this.options['everyone'] === 0
            ? message.channel.send('`@everyone`')
            : (this.options['everyone'] === 1
              ? message.channel.send('`@here`')
              : null
            )

          console.log(mentionMessage)
          mentionMessage !== Promise ? mentionMessage.delete({ timeout: 10000 }) : null

          let preview = await message.channel.send('`Preview`', anuncioembed)
          preview.delete({ timeout: 10000 })

          break;

        case '739210631441547296':

          await msg.delete({ timeout: 100 })

          this.options['everyone'] === 0
            ? message.channel.send('@everyone')
            : (this.options['everyone'] === 1
              ? message.channel.send('@here')
              : null
            )

          message.channel.send(anuncioembed);

          break;

        case '739176302317273089':

          this.respond(t('commands:anunciar.canceled'))
          msg.delete({ timeout: 100 })

          break;

      }
    })

    collector.on('end', () => {
      if (collector.endReason() === 'limit') return;

      msg.delete({ timeout: 100 })

      this.respond(t('commands:anunciar.end'))
    })
  }
}

module.exports = Alert;