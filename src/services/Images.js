const Canvas = require('canvas')
const nodeHtmlToImage = require('node-html-to-image')

module.exports = class {
  constructor(user) {
    this.user = user
  }

  async loadPerfil() {
    const user = this.user

    const WIDTH = 1000
    const HEIGHT = 900

    const AVATAR_SIZE = 150
    const INNER_MARGIN = 425

    const CARD_MARGIN = 200

    const canvas = Canvas.createCanvas(WIDTH, HEIGHT)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#0a1621'
    ctx.fillRect(0, CARD_MARGIN, WIDTH, HEIGHT)

    ctx.fillStyle = '#12263a'
    ctx.fillRect(0, CARD_MARGIN, WIDTH, 10)

    const IMAGE_ASSETS = Promise.all([
      Canvas.loadImage(user.displayAvatarURL({ format: 'png' }))
    ])

    const [avatarImage] = await IMAGE_ASSETS

    const AVATAR_HALF = AVATAR_SIZE * 0.5 // 75
    const AVATAR_Y = CARD_MARGIN - (AVATAR_SIZE * 0.8)

    ctx.save()

    ctx.beginPath();
    ctx.arc(INNER_MARGIN + AVATAR_HALF, AVATAR_Y + AVATAR_HALF, AVATAR_HALF, 0, Math.PI * 3);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(avatarImage, INNER_MARGIN, AVATAR_Y, AVATAR_SIZE, AVATAR_SIZE);
    ctx.restore()

    ctx.font = '30px Arial';
    ctx.fillStyle = '#fff'
    ctx.fillText(user.username + '#' + user.discriminator, 400, AVATAR_Y + 200)

    // Line 1
    ctx.fillStyle = '#333'
    ctx.fillRect(50, CARD_MARGIN + 250, 250, 100)

    ctx.fillStyle = '#333'
    ctx.fillRect(WIDTH - (50 + 250), CARD_MARGIN + 250, 250, 100)

    // Line 2
    ctx.fillStyle = '#333'
    ctx.fillRect(50, CARD_MARGIN + 370, 250, 100)

    ctx.fillStyle = '#333'
    ctx.fillRect(WIDTH - (50 + 250), CARD_MARGIN + 370, 250, 100)

    // Medium Line
    ctx.fillStyle = '#333'
    ctx.fillRect(50 + 270, CARD_MARGIN + 250, 360, 220)

    // Final Line

    ctx.fillStyle = '#333'
    ctx.fillRect(50, CARD_MARGIN + 500, WIDTH - 100, 175)

    return canvas.toBuffer()
  }

  async loadShip(user, user2, chance) {
    const IMAGE_ASSETS = Promise.all([
      Canvas.loadImage(user.user.displayAvatarURL({ format: 'png' })),
      Canvas.loadImage(user2.user.displayAvatarURL({ format: 'png' }))
    ])

    const ICONS_ASSETS = Promise.all([
      Canvas.loadImage('https://cdn.discordapp.com/emojis/752143681213169764.png?'),
      Canvas.loadImage('https://cdn.discordapp.com/emojis/751406085763498035.png?'),
      Canvas.loadImage('https://cdn.discordapp.com/emojis/709840579080486982.png?')
    ]);
    console.log(await IMAGE_ASSETS)

    const [user1AvatarImage, user2AvatarImage] = await IMAGE_ASSETS
    const [maybe, heart, love] = await ICONS_ASSETS

    const canvas = Canvas.createCanvas(250, 100)
    const ctx = canvas.getContext('2d')

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

  async loadShip2(user1, user2, chance) {
    const image = await nodeHtmlToImage({
      html: `<html>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: Roboto;
              width: 420px;
              height: 220px;
              background: linear-gradient(to right, #dc2424, #4a569d);
              display: flex;
              align-items: center;
              justify-content: center;
            }

            h1 {
              color: #FFF;
              margin-bottom: 90px;
            }

            div {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 154px;
              width: 395px;
              background-color: rgba(33, 33, 33, 30%);
              border-radius: 20px;
            }

            .avatar {
              margin: 60px;
              height: 80px;
              border: 5px solid #0278ae;
              border-radius: 50%;
              margin-bottom: 70px;
            }
          </style>
        </head>
        <body>
          <div>
            <img src={{avatar1}} alt="avatar" class="avatar" >
            <h1>{{c}}%</h1>
            <img src={{avatar2}} alt="avatar" class="avatar" >
          <div>
        </body>
      </html>`,
      content: { avatar1: user1.user.displayAvatarURL(), avatar2: user2.user.displayAvatarURL(), c: `${chance}` }
    })

    return image
  }
}