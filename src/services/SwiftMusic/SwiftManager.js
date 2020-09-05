const { EventEmitter } = require('events');

const SwiftPlayer = require('./SwiftPlayer');

const SwiftNode = require('./SwiftNode');

const Collection = require('@discordjs/collection');

const fetch = require('node-fetch');

const Node = require('./structures/Node');


module.exports = class SwiftManager extends EventEmitter {

  constructor(client, nodes) {
    super({});

    this.user = client.user.id;

    this.client = client;

    this.nodes = [];

    this.players = new Collection();

    this.voiceStates = new Collection();

    this.voiceServers = new Collection();

    this.Player = SwiftPlayer;

    this.shards = 0;

    for (const node of nodes) this.addNode(node)
  }


  async addNode(node) {
    const create = new SwiftNode(this, node);

    const add = new Node(node)
    const push = await add.push()
    this.nodes.push(push)

    await create.connect();
  }





  async join(data = {}) {
    const player = this.players.get(data.guild);

    if (player) return player;

    this.sendManager({
      op: 4,
      d: {
        guild: data.guild,
        channel: data.voiceChannel.id
      }
    })

    return this.createPlayer(data);
  }


  async leave(guild) {
    this.sendManager({
      op: 4,
      d: {
        guild: guild,
        channel: null
      }
    })


    const player = this.players.get(guild);

    if (!player) return false;

    player.removeAllListeners();
    player.send('destroy');

    return this.players.delete(guild)
  }


  voiceServersUpdate(data) {
    this.voiceServers.set(data.guild, data)
    return this._attemptConnection(data.guild)
  }


  voiceStateUpdate(data) {

    if (data.user_id != this.user) return


    if (data.channel_id) {

      this.voiceStates.set(data.guild_id, data)
      return this._attemptConnection(data.guild_id)

    }

    this.voiceServers.delete(data.guild_id)
    this.voiceStates.delete(data.guild_id)
  }




  _attemptConnection(guild) {
    const server = this.voiceServers.get(guild)
    const state = this.voiceStates.get(guild)

    if (!server) return false

    const player = this.players.get(guild)
    if (!player) return false

    player.connect({ sessionId: state ? state.session_id : player.voiceUpdateState.sessionId, event: server })

    return true
  }


  getNode() {
    return [...this.nodes.values()]
      .filter(node => node.connected)
      .sort((a, b) => b.stats.players - a.stats.players)
  }


  createPlayer(data) {

    const verify = this.nodes.get(data.guild);
    if (verify) return verify;

    const node = this.nodes.get(this.getNode()[0].tag);

    const player = new this.Player(node, data, this);

    this.players.set(data.guild, player);


    return player;
  }



  async search(query, source) {

    const node = this.getNode()[0];

    if (!/^https?:\/\//.test(query)) {
      query = `${source || 'yt'}search:${query}`;
    }


    const params = new URLSearchParams({ identifier: query });

    return await fetch(`http://${node.host}:${node.port}/loadtracks?${params}`, {
      headers: {
        Authorization: node.password
      }
    }).then(res => res.json())
      .catch(error => { throw new Error('Não foi possível encontrar nenhum resultado.', error) })

  }


  sendManager(data) {
    const guild = this.client.guilds.cache.get(data.d.guild);

    return guild.shard.send(data)
  }
}