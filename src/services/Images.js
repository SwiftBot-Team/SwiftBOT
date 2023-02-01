const Canvas = require('canvas')
const canvacord = require('canvacord')
const itens = require("../utils/Store");
const { fillTextWithTwemoji } = require('node-canvas-with-twemoji-and-discord-emoji');

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

function numberWithCommas(x) {
  x = x.toString();
  var pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x))
    x = x.replace(pattern, "$1 $2");
  return x;
}

module.exports = class {
  constructor(user) {
    this.user = user
  }

  resolveAlign(x, y, width, height) {
    const realCoords = { x, y }
    realCoords.y = y * 0.5
    return realCoords
  }

  roundImage(img, w = img.width, h = img.height, r = w * 0.5, $ctx, x, y) {
    const roundImageCanvas = () => {
      const canvas = Canvas.createCanvas(w, h)
      const ctx = canvas.getContext('2d')

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.globalCompositeOperation = 'source-over'
      ctx.drawImage(img, 0, 0, w, h)

      ctx.fillStyle = '#fff'
      ctx.globalCompositeOperation = 'destination-in'
      ctx.beginPath()
      ctx.arc(w * 0.5, h * 0.5, r, 0, Math.PI * 2, true)
      ctx.closePath()
      ctx.fill()

      return canvas
    }

    $ctx.drawImage(roundImageCanvas(img, w, h, r), x, y, w, h)
  }

  async topmoney(client) {
    const ref = await client.database.ref('SwiftBOT/Economia/').once('value');

    let allValues = ref.val();

    const sort = Object.values(allValues).sort((a, b) => (b.coins + (b.bank || 0)) - (a.coins + (a.bank || 0)));

    const users = []

    sort.map((value, i) => {
      Object.values(allValues).map((user, i) => {
        if (user === value) {
          if (!client.users.cache.get(Object.keys(allValues)[i])) return
          users.push({ user: Object.keys(allValues)[i], bank: user.bank || 0, coins: user.coins })
        }
      })
    })

    return users
  }

  async loadPerfil(user, client, t) {
    Canvas.registerFont('src/assets/fonts/Poppins-Regular.ttf', { family: 'Poppins' })
    Canvas.registerFont('src/assets/fonts/Poppins-Bold.ttf', { family: 'Poppins', weight: 'bold' })

    const ASSETS = Promise.all([
      Canvas.loadImage('src/assets/Perfil.png'),
      Canvas.loadImage(user.displayAvatarURL({ format: 'png' })),
    ]);

    const [background, userAvatar] = await ASSETS

    const canvas = Canvas.createCanvas(400, 505)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(background, 0, 0, 400, 505)

    this.roundImage(userAvatar, 85, 85, 37, ctx, 157, 16)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 18px "Poppins"'
    await fillTextWithTwemoji(ctx, user.username, 400/2, 120)
    
    ctx.fillStyle = '#B7B4B4'
    ctx.font = 'bold 16px "Poppins"'
    ctx.fillText('#'+user.discriminator, 400/2, 137)

    let bankText = numberWithCommas(await client.controllers.money.getBalanceInBank(user.id))
    if (bankText === 'false') bankText = t('utils:no')
    const bankX = 48
    const bankY = ((ctx.measureText(bankText).actualBoundingBoxAscent)+227)+(ctx.measureText(bankText).actualBoundingBoxAscent*0.25)

    const moneyText = numberWithCommas(await client.controllers.money.getBalance(user.id))
    const moneyX = 48
    const moneyY = ((ctx.measureText(moneyText).actualBoundingBoxAscent)+252)+(ctx.measureText(moneyText).actualBoundingBoxAscent*0.25)

    ctx.textAlign = 'left'

    ctx.fillStyle = '#7C7575'
    ctx.font = '16px "Poppins"'
    ctx.fillText(bankText, bankX, bankY)

    ctx.font = '16px "Poppins"'
    ctx.fillText(moneyText, moneyX, moneyY)

    const rankText = numberWithCommas(await client.controllers.money.getRank(user.id))
    const rankX = 230
    const rankY = ((ctx.measureText(rankText).actualBoundingBoxAscent)+227)+(ctx.measureText(rankText).actualBoundingBoxAscent*0.25)

    const topmoney = await this.topmoney(client)
    const topText = numberWithCommas(topmoney.indexOf(topmoney.find((u) => u.user === user.id))+1)
    const topX = 230
    const topY = ((ctx.measureText(topText).actualBoundingBoxAscent)+326)+(ctx.measureText(topText).actualBoundingBoxAscent*0.25)

    ctx.font = '16px "Poppins"'
    ctx.fillText(rankText, rankX, rankY)

    ctx.fillText(topText+'º', topX, topY)


    const badges = Promise.all([
      Canvas.loadImage('https://cdn.discordapp.com/emojis/808041800446377995.png'),
      Canvas.loadImage('https://cdn.discordapp.com/emojis/782752067303112724.png'),
      Canvas.loadImage('https://cdn.discordapp.com/emojis/815381545270771724.png')
    ])

    const [staff, friend, first] = await badges

    const $user = client.guilds.cache.get('631467420510584842').members.cache.get(user.id)

    const serializedBadges = []
    if ($user && $user.roles.cache.has('764922979338944512')) serializedBadges.push(staff)
    if ($user && $user.roles.cache.has('764932207155478530')) serializedBadges.push(friend)
    if (topmoney.indexOf(topmoney.find((u) => u.user === user.id))+1 === 1) serializedBadges.push(first)

    let X = 27

    serializedBadges.map((badge) => {
      ctx.drawImage(badge, X, 326, 30, 30)
      X += 35
    })

    const db = await client.database.ref(`SwiftBOT/users/${user.id}/stamp`).once('value')

    const i = itens(t).find(i => i.id === db.val())

    if (!i) return canvas.toBuffer()
    const MORE = Promise.all([
      Canvas.loadImage(i.img)
    ]);

    const [stamp] = await MORE

    stamp && ctx.drawImage(stamp, 163, 398, 74, 74)

    return canvas.toBuffer()
  }

  async loadShip(user, user2, chance) {
    const IMAGE_ASSETS = Promise.all([
      Canvas.loadImage(user.user.displayAvatarURL({ format: 'png' })),
      Canvas.loadImage(user2.user.displayAvatarURL({ format: 'png' }))
    ])

    const ICONS_ASSETS = Promise.all([
      Canvas.loadImage('https://cdn.discordapp.com/emojis/782752066732294204.png?'),
      Canvas.loadImage('https://cdn.discordapp.com/emojis/782752067303112724.png?'),
      Canvas.loadImage('https://cdn.discordapp.com/emojis/782752060693151754.png?')
    ]);

    const [user1AvatarImage, user2AvatarImage] = await IMAGE_ASSETS
    const [maybe, heart, love] = await ICONS_ASSETS

    const canvas = Canvas.createCanvas(250, 100)
    const ctx = canvas.getContext('2d')

    var lingrad = ctx.createLinearGradient(0, 0, 250, 100)
    lingrad.addColorStop(0, '#dc2424')
    lingrad.addColorStop(1, '#4a569d')

    ctx.fillStyle = lingrad
    ctx.fillRect(0, 0, 250, 100)

    ctx.textAlign = 'center'
    ctx.font = '16px sans-serif'
    ctx.fillStyle = "#fff"
    ctx.fillText(`${chance}%`, 125, 25)

    ctx.save()

    ctx.beginPath();
    ctx.arc(45, 50, 25, 0 * Math.PI, 2 * Math.PI);
    ctx.closePath();
    ctx.clip()

    ctx.drawImage(user1AvatarImage, 20, 25, 50, 50);

    ctx.restore()

    ctx.save()

    ctx.beginPath();
    ctx.arc(205, 50, 25, 0 * Math.PI, 2 * Math.PI);
    ctx.closePath();
    ctx.clip()

    ctx.drawImage(user2AvatarImage, 180, 25, 50, 50);

    ctx.restore()

    if (chance >= 90) ctx.drawImage(love, (canvas.width * 0.5) - 25, 30, 50, 50)

    if (chance >= 75 && chance < 90) ctx.drawImage(heart, (canvas.width * 0.5) - 25, 30, 50, 50)
    if (chance <= 75) ctx.drawImage(maybe, (canvas.width * 0.5) - 25, 30, 50, 50)

    return canvas.toBuffer()
  }

  async covid19(cases, deaths, recovered, local, client, guild) {
    const t = await client.getTranslate(guild.id)

    const IMAGE_ASSETS = Promise.all([
      Canvas.loadImage('src/assets/Covid.png'),
      Canvas.loadImage('https://img.icons8.com/cotton/2x/earth-planet--v2.png')
    ])

    const [covid, earth] = await IMAGE_ASSETS

    const canvas = Canvas.createCanvas(700, 200)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(covid, 10, 10)

    ctx.fillStyle = '#fff'
    ctx.font = '18px Montserrat'
    ctx.fillText(numberWithCommas(deaths), 75, 70)

    ctx.fillStyle = '#fff'
    ctx.font = '18px Montserrat'
    ctx.fillText(numberWithCommas(cases), 272, 70)

    ctx.fillStyle = '#fff'
    ctx.font = '18px Montserrat'
    ctx.fillText(numberWithCommas(recovered), 180, 152)

    if (!local) {
      earth.onload = () => {
        earth.height = 100
        earth.width = 100
      }

      ctx.drawImage(earth, 613 - 40, 18, 100, 100)

      ctx.fillStyle = '#fff'
      ctx.font = '18px Montserrat'
      ctx.fillText(t('commands:covid19.all'), 595, 150)
    } else {
      const ARG_LOCAL = Promise.all([
        Canvas.loadImage(local.flag)
      ])

      const [flag] = await ARG_LOCAL

      flag.onload = () => {
        flag.height = 84
        flag.width = 56
      }

      ctx.drawImage(flag, 580, 40, 84, 56)

      ctx.fillStyle = '#fff'
      ctx.font = '18px Montserrat'
      ctx.fillText(local.name, 605, 150)
    }

    return canvas.toBuffer()
  }


  async loadGift(code) {
    const IMAGE_ASSETS = Promise.all([
      Canvas.loadImage('src/assets/Gift.jpg'),
    ])

    const [background] = await IMAGE_ASSETS

    const canvas = Canvas.createCanvas(500, 188)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(background, 10, 10)

    ctx.fillStyle = '#fff'
    ctx.font = '18px Montserrat'
    ctx.fillText(code, 261, 98)

    return canvas.toBuffer()
  }

  disconnected(text) {
    return `http://useless-api--vierofernando.repl.co/disconnected?text=${text}`
  }

  async triggered(user) {
    let image = await canvacord.Canvas.trigger(user.displayAvatarURL({
      format: 'png',
      dynamic: false
    }));

    return image
  }

  flip(user) {
    return `http://useless-api--vierofernando.repl.co/flip?image=${user.displayAvatarURL({ size: 2048 })}&.gif`
  }

  burn(user) {
    return `http://useless-api--vierofernando.repl.co/burn?image=${user.displayAvatarURL({ size: 2048 })}&.gif`
  }

  async pixelate(image) {
    let $image = await canvacord.Canvas.pixelate(image);

    return $image
  }

  async trash(user) {
    let image = await canvacord.Canvas.trash(user.displayAvatarURL({
      format: 'png',
      dynamic: false,
      size: 2048
    }));

    return image
  }

  async wasted(user) {
    let image = await canvacord.Canvas.wasted(user.displayAvatarURL({
      format: 'png',
      dynamic: false,
      size: 2048
    }));

    return image
  }

  async blur(image) {
    let $image = await canvacord.Canvas.blur(image)

    return $image
  }

  async grey(image) {
    let $image = await canvacord.Canvas.greyscale(image)

    return $image
  }

  async invert(image) {
    let $image = await canvacord.Canvas.invert(image)

    return $image
  }

  stonks(avatar, isNotStonks) {
    return `https://vacefron.nl/api/stonks?user=${avatar}&notstonks=${isNotStonks}`
  }

  ejected(name, impostor, color) {
    return `https://vacefron.nl/api/ejected?name=${name}&impostor=${impostor}&crewmate=${color}`
  }

  emergencymeeting(text) {
    return `https://vacefron.nl/api/emergencymeeting?text=${text}`
  }

  async nowPlaying(player) {
    const images = Promise.all([
      Canvas.loadImage('bg.png'),
      Canvas.loadImage(`https://i.ytimg.com/vi/${videoID}/hq720.jpg`),
      Canvas.loadImage('npaused.png'),
      Canvas.loadImage('ypaused.png')
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
    ctx.fillRect(368, 147, 392 / Math.floor(videoMax / videoNow), 3)

    const $var = 392 / Math.floor(videoMax / videoNow)
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

    if (!paused) {
      ctx.drawImage(npaused, 406, 181, 24, 24)
      ctx.drawImage(npaused, 34, 361, 24, 24)
      ctx.fillText(TextAbstract(videoTitle, 50), 103, 381)
    } else {
      ctx.drawImage(ypaused, 406, 181, 24, 24)
      ctx.drawImage(ypaused, 34, 361, 24, 24)
      ctx.fillText(TextAbstract(videoTitle, 50), 103, 381)
    }
  }
}
