const Canvas = require('canvas')
const { getPalette } = require('colorthief')
const RGBToHex = require('../utils/RGBToHex')

module.exports = new class {
  async getColors(imageURL) {
    const palette = await getPalette(imageURL)

    Canvas.registerFont('src/assets/fonts/Poppins-Regular.ttf', { family: 'Poppins' })
    Canvas.registerFont('src/assets/fonts/Poppins-Bold.ttf', { family: 'Poppins', weight: 'bold' })

    const newColors = palette.splice(0, 6);

    const canvas = Canvas.createCanvas(newColors.length * 83, 200);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#393e46';
    ctx.fillRect(0, 0, 500, 200);

    newColors.map((c, i) => {
      ctx.fillStyle = `rgb(${c.join()})`;
      ctx.fillRect(i * 83, 0, 83, 200);
    });

    ctx.fillStyle = `rgba(256, 256, 246, 0.8)`;
    ctx.fillRect(0, 0, newColors.length * 83, 30);

    newColors.map((c, i) => {
      ctx.font = 'bold 14px "Poppins"'
      ctx.fillStyle = `rgb(${c.join()})`
      ctx.textAlign = 'center'
      ctx.fillText(RGBToHex(c), 41.5 + (i * 83), 18)
    })

    return canvas.toBuffer();
  }
}