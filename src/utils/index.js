module.exports = {
    createOptionHandler(structureName, structureOptions, options = {}) {
        if (!options.optionalOptions && typeof options === 'undefined') {
            throw new Error(`A opção da estrutura "${structureName}" é obrigatória.`)
        }

        return ({
            optional(name, defaultValue = null) {
                const value = structureOptions[name]

                return typeof value === 'undefined'
                    ? defaultValue
                    : value
            },

            required(name) {
                const value = structureOptions[name]

                if (typeof value === 'undefined') {
                    throw new Error(`A opção "${name}" da estrutura "${structureName}" é obrigatória.`)
                }
                return value
            }
        })
    },

    convertHourToMinutes(time) {
        const [hour, minutes] = time.split(':').map(Number);
        const timeInMinutes = (hour * 60) + minutes;

        return timeInMinutes;
    },

    msToTime(duration) {
        let minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24) - 3;

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;

        return hours + ":" + minutes;
    },

    convertMS(time) {
        time = Math.round(time / 1000);
        const s = time % 60,
            m = Math.floor((time / 60) % 60),
            h = Math.floor((time / 60 / 60) % 24),
            d = Math.floor(time / 60 / 60 / 24);

        return {
            d: d,
            h: h,
            m: m,
            s: s
        }
    },

    getUser(message, args) {
        const user = message.mentions.members.first() ? message.mentions.members.first() : message.guild.members.cache.get(args) || message.guild.members.cache.find(member => member.username === args) || message.guild.members.cache.find(c => c.user.username === args);

        return user ? user : undefined
    }
}

const Canvas = require('canvas')
const { Context2d,loadImage } = Canvas

const { parse } = require("twemoji-parser");

Context2d.prototype.roundImage = function (img, x, y, w, h, r) {
    this.drawImage(this.roundImageCanvas(img, w, h, r), x, y, w, h)
    return this
}

Context2d.prototype.roundImageCanvas = function (img, w = img.width, h = img.height, r = w * 0.5) {
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

Context2d.prototype.circle = function (x, y, r, a1, a2, fill = true, stroke = false) {
    this.beginPath()
    this.arc(x, y, r, a1, a2, true)
    this.closePath()
    if (fill) this.fill()
    if (stroke) this.stroke()
    return this
}

Context2d.prototype.fillWithEmoji = async function(text, x, y, maxWidth) {
    let emojiPercent1 = 0.1;
    let emojiPercent2 = 0.1;
    let fontSize = parseInt(this.font);
    let emojiSideMargin = fontSize * emojiPercent1;
    let emojiUpMargin = fontSize * emojiPercent2;
    let entity = text.split(" ");
    const baseLine = this.measureText("").alphabeticBaseline;
    let currWidth = 0;
    for (let i = 0; i < entity.length; i++) {
        const ent = entity[i];
        let parsed = parse(ent);
        if (ent.match(/<?(a:|:)\w*:(\d{17}|\d{18})>/)) {
            let matched = ent.match(/<?(a:|:)\w*:(\d{17}|\d{18})>/);
            let img = await loadImage(
                `https://cdn.discordapp.com/emojis/${matched[2]}.png`
            );
            this.drawImage(
                img,
                x + currWidth + emojiSideMargin,
                y + emojiUpMargin - fontSize - baseLine,
                fontSize,
                fontSize
            );
            currWidth += fontSize + emojiSideMargin * 2 + fontSize / 5;
        } else if (parsed.length > 0) {
            let img = await loadImage(parsed[0].url);
            this.drawImage(
                img,
                x + currWidth + emojiSideMargin,
                y + emojiUpMargin - fontSize - baseLine,
                fontSize,
                fontSize
            );
            currWidth += fontSize + emojiSideMargin * 2 + fontSize / 5;
        } else {
            this.fillText(ent, x + currWidth, y, maxWidth);
            currWidth += this.measureText(ent).width + fontSize / 5;
        }
    }
}

Context2d.prototype.write = function (text, x, y, font, align = ALIGN.BOTTOM_LEFT) {
    this.font = font
    const { width, height } = this.measureText(this, font, text)
    this.fillText(text, realX, realY)
    return {
      leftX: realX,
      rightX: realX + width,
      bottomY: realY,
      topY: realY - height,
      centerX: realX + width * 0.5,
      centerY: realY - height * 0.5,
      width,
      height
    }
  }