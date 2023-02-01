const Base = require("../../services/Command");
const Canvas = require('canvas')
const Discord = require('discord.js')
require('../../utils/index')

function TextAbstract(text, length) {
  if (text == null) {
    return "";
  }
  if (text.length <= length) {
    return text;
  }
  text = text.substring(0, length);
  last = text.lastIndexOf(" ");
  text = text.substring(0, last);
  return text + "...";
}

class tocando extends Base {
  constructor(client) {
    super(client, {
      name: "tocando",
      description: "descriptions:tocando",
      category: "categories:music",
      usage: "usages:tocando",
      cooldown: 3000,
      aliases: ['playing', 'np', 'nowplaying'],
      requiresPlayer: true,
      slash: true
    })
  }

  async run({ message, args, prefix, player }, t) {

    if (!player) return;

    const $thumb = player.queue.current.thumbnail,
      videoTitle = player.queue.current.title,
      videoAuthor = player.queue.current.author,
      paused = player.paused,
      videoMax = player.queue.current.duration,
      videoNow = player.position,
      playlist = []

    for (let i = 0; i < 6; i++) {
      if (player.queue[i]) {
        playlist.push({
          title: player.queue[i].title
        })
      }
    }

    let count = 403,
      count2 = 421

    const images = Promise.all([
      Canvas.loadImage('src/assets/bg.png'),
      Canvas.loadImage($thumb.replace('default', 'hq720')),
      Canvas.loadImage('src/assets/npaused.png'),
      Canvas.loadImage('src/assets/ypaused.png')
    ])

    const [background, thumb, npaused, ypaused] = await images

    const canvas = Canvas.createCanvas(792, 854)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(background, 0, 0)
    ctx.roundImage(thumb, 34, 40, 320, 180, 340)

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 24px Montserrat'
    ctx.fillText(TextAbstract(videoTitle, 30), 368, 70)

    ctx.fillStyle = '#fff'
    ctx.font = '18px Montserrat'
    ctx.fillText(TextAbstract(videoAuthor, 30), 368, 95)

    ctx.fillStyle = '#fff'
    ctx.fillRect(368, 147, 392, 3)

    ctx.fillStyle = '#CE3546'
    ctx.fillRect(368, 147, 392 / (videoMax / videoNow), 3)

    const $var = 392 / (videoMax / videoNow)
    ctx.fillStyle = '#CE3546'

    ctx.circle(368 + $var, 148, 8, 0, Math.PI * 2, true)

    ctx.fillStyle = '#fff'
    ctx.font = '24px Montserrat'
    playlist.map((song) => {
      ctx.drawImage(ypaused, 34, count, 24, 24)
      ctx.fillText(TextAbstract(song.title, 50), 103, count2)
      count += 40
      count2 += 41
    })

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 24px Montserrat'

    ctx.fillText(player.volume / 2 + '%', 29, 820)

    if (!player.queueRepeat) {
      ctx.fillText(t('commands:tocando.no'), 376, 820)
    } else {
      ctx.fillText(t('commands:tocando.yes'), 376, 820)
    }

    const users = message.guild.me.voice.channel.members.filter(u => !u.user.bot).size

    ctx.fillText(users, 734, 820)

    if (!paused) {
      ctx.drawImage(npaused, 406, 181, 24, 24)
      ctx.drawImage(npaused, 34, 361, 24, 24)
      ctx.fillText(TextAbstract(videoTitle, 50), 103, 381)
    } else {
      ctx.drawImage(ypaused, 406, 181, 24, 24)
      ctx.drawImage(ypaused, 34, 361, 24, 24)
      ctx.fillText(TextAbstract(videoTitle, 50), 103, 381)
    }

    return message.quote(new Discord.MessageAttachment(canvas.toBuffer()))

  }
}
module.exports = tocando
