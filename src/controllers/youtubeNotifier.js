const EventEmitter = require('events');
const pubsubhubbub = require('pubsubhubbub');

const xml = require('xml2js');

const topicBase = 'http://www.youtube.com/xml/feeds/videos.xml?channel_id=';

module.exports = class youtubeNotifier extends EventEmitter {
    constructor(options) {
        super({})
    }
}