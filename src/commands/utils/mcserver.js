const Base = require("../../services/Command");
const { get } = require('axios')
const Discord = require('discord.js')

class McServer extends Base {
  constructor(client) {
    super(client, {
      name: "mcserver",
      description: "descriptions:mcserver",
      usage: "usages:mcserver",
      category: "categories:utils",
      cooldown: 1000,
      aliases: ["mcs", "info-minecraftserver"]
    });
  }

  async run({ message, args, prefix }, t) {

    if (!args[0]) return this.respond(t('commands:mcserver.error'));

    const [mcIP, port] = args;
    try {
      const { data } = await get(`https://api.minetools.eu/ping/${mcIP}${port ? `/${port}` : ''}`).catch(err => this.respond(t('commands:mcserver.reqError')));

      if (!data) return this.respond(t('commands:mcserver.reqError'));

      const icon = `https://api.minetools.eu/favicon/${mcIP}${port ? `/${port}` : ''}`

      let status = data.latency
        ? data.players.online
          ? `<:465183814080266240:653041442348072973> ${t('commands:mcserver.online', { server: mcIP })} ** ${data.players.online}** ${t('commands:mcserver.now')} `
          : `<: 465183814080266240:653041442348072973> ${t('commands:mcserver.online', { server: mcIP })} ${t('commands:mcserver.nowZero')} `
        : `<:SwitcherOff:759057635064021055> ${t('commands:mcserver.offline', { server: mcIP })} `


      let author = { text: mcIP, image: icon }

      const send = await this.respond(status, true, { image: data.latency ? `http://status.mclive.eu/${mcIP}/${mcIP}/25565/banner.png` : ``, author });

      const query = await get(`https://api.minetools.eu/query/${mcIP}${port ? `/${port}` : ''}`);

      if (!query || query.data.error) return;

      const pages = Math.ceil(query.data.Playerlist.length / 100);

      let page = -1;

      send.react('⏩');
      send.react('⏪');

      send.createReactionCollector((r, u) => ['⏩', '⏪'].includes(r.emoji.name) && u.id === message.author.id)

        .on('collect', async (r, u) => {
          switch (r.emoji.name) {
            case '⏩':

              if (page === pages - 1) return;

              page++;

              send.edit(new this.client.embed()
                .setAuthor(mcIP, icon)
                .setTitle('Playerlist')
                .setImage(`http://status.mclive.eu/${mcIP}/${mcIP}/25565/banner.png`)
                .setDescription(`\`${query.data.Playerlist.slice(page * 100, (page + 1) * 100).map(p => p).join(', ')}\` `))
              break;

            case '⏪':

              if (page === -1) return;

              page--;

              if (page === -1) {
                return send.edit(new this.client.embed()
                  .setAuthor(mcIP, icon)
                  .setDescription(status)
                  .setImage(`http://status.mclive.eu/${mcIP}/${mcIP}/25565/banner.png`))
              }

              send.edit(new this.client.embed()
                .setAuthor(mcIP, icon)
                .setTitle('Playerlist')
                .setImage(`http://status.mclive.eu/${mcIP}/${mcIP}/25565/banner.png`)
                .setDescription(`\`${query.data.Playerlist.slice(page * 100, (page + 1) * 100).map(p => p).join(', ')}\` `))

              break;
          }
        })
    } catch (error) {
      console.log(error);
      return this.respond(t('commands:mcserver.reqError'))
    }
  }
}

module.exports = McServer;