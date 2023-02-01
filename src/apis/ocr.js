const Tesseract = require('tesseract.js')

module.exports = class OCR {
    constructor() {
        this.name = 'ocr'
    }

    async execute(image) {
        return await Tesseract.recognize(
            image
        ).then(({ data: { text } }) => {
            return text
        })
    }
}