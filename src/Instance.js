const { EventEmitter } = require('events')
const winston = require('winston')
require('winston-daily-rotate-file')

const logger = winston.createLogger({
    level: 'verbose',
    transports: [
      new winston.transports.DailyRotateFile({
        filename: '../errors.log',
        datePattern: 'yyyy-MM-dd.',
        prepend: true,
        level: 'error'
      }),
      new winston.transports.Console({
        json: false
      })
    ]
});


winston.add(logger)

module.exports = class Instance extends EventEmitter {
    async log(type, data) {
        this.emit(type, data ? data : null)
    }

    async error(data) {
        logger.log('error', data)
    }
}
