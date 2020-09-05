const { EventEmitter } = require('events');

module.exports = class SwiftPlayer extends EventEmitter {

  constructor(node, options, manager) {
    super({});

    this.manager = manager;

    this.node = node;

    this.guild = options.guild;

    this.voiceChannel = options.voiceChannel;

    this.textChannel = options.textChannel;

    this.stats = {
      playing: false,
      paused: false,
      volume: 100,
      looped: false,
      track: {}
    }

    this.position = 0;

    this.queue = [];


    this.on('event', data => {
      (this.getEvent(data).bind(this))()
    }).on('playerUpdate', packet => {
      this.state = { volume: this.state.volume, equalizer: this.state.equalizer, ...packet.state }
    })

  }


  play(track, data) {
    const sound = this.queue.length ? track : this.queue[0];

    const packet = this.send('play', { ...data, track: sound.track });

    this.stats.playing = true;
    this.stats.track = track;

    return packet;
  }



  stop() {
    const packet = this.send('stop');

    this.playing = false;

    return packet;
  }

  pause(pause = true) {
    const packet = this.send('pause', { pause });

    this.paused = pause === true ? true : false;

    return packet;
  }

  volume(volume) {
    const packet = this.send('volume', { volume: volume })
    this.state.volume = volume;

    return packet;
  }

  seek(timestamp) {
    return this.send('seek', { position: timestamp });
  }


  loop(loop = false) {
    return this.looped = loop = true ? true : false;
  }

  connect(data) {
    this.voiceUpdateState = data
    return this.send('voiceUpdate', data)
  }

  leave() {
    return this.manager.leave(this.guild)
  }

  getEvent(data) {

    const events = {
      'TrackStartEvent': function () {
        this.manager.emit('trackStart', this, this.track)

      },

      'TrackEndEvent': function () {

        if (this.stats.track && this.stats.looped === true) {
          this.manager.emit('trackEnd', this, this.track)
          this.queue.add(this.queue.shift())
          return this.play()

        } else if (this.queue.length <= 1) {
          this.queue.shift();
          this.stats.playing = false;

          if (['REPLACED', 'FINISHED', 'STOPPED'].includes(data.reason)) {
            this.manager.emit('queueEnd', this)
          }

        } else if (this.queue.length > 0) {
          this.queue.shift()
          this.manager.emit('trackEnd', this, this.track)
          return this.play()
        }

      },

      'WebSocketClosedEvent': function () {

        if ([4015, 4009].includes(data.code)) {
          this.manager.sendManager({
            op: 4,
            d: {
              guild: data.guildId,
              channel: this.voiceChannel
            }
          })

        }

        this.manager.emit('socketClosed', this, data);
      },

      'default': function () { throw new Error(`Evento desconhecido emitido: '${data}'.`) }

    }

    return events[data.type] || events['default'];
  }


  send(op, data) {
    return this.node.send({ ...data, op, guildId: this.guild })
  }
}