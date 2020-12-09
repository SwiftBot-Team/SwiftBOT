const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const API_URL = 'https://api.spotify.com/v1'

const { get } = require('axios');

module.exports = class SwiftPlayer {
  constructor() {

    this.spotifyKey = false;

  };

  async convertTime(time) {

    let seconds = Math.floor((time / 1000) % 60)
    let minutes = Math.floor((time / (1000 * 60)) % 60) + ':'
    let hours = Math.floor((time / (1000 * 60 * 60)) % 24) + ':'
    let days = Math.floor((time / (1000 * 60 * 60 * 24) % 24)) + ':'



    return `${days.replace('0:', '')}${hours.replace('0:', '')}${minutes}${seconds}`
  }

  async converTimePlaying(actual, max) {

    const percent = actual / max;

    const progress = Math.round((15 * percent));

    const empty = 15 - progress;

    const text = "▬".repeat(progress);

    const secondText = "▬".repeat(empty);

    return `▶️ ${text}🔘${secondText} \`[${await this.convertTime(actual)} / ${await this.convertTime(max)}]\``;
  }


  async getLyrics(player) {

    const { KSoftClient } = require('@ksoft/api');

    const ksoft = new KSoftClient(process.env.KSOFT_API);

    try {
      const search = await ksoft.lyrics.search(player.queue.current.title);

      return {
        lyrics: search[0].lyrics,
        image: search[0].artwork
      };
    } catch (err) {
      if (!err.message === 'No results') console.log(err);

      return false
    }
  }

  async getType(data) {
    if (data.includes('spotify')) return {
      type: 'spotify', data: await this.getSpotifyMusic(data)
    };

    else {

      return { type: 'youtube', data: [data] }

    }
  }


  async getSpotifyMusic(data) {

    if (!this.spotifyKey || this.spotifyKey && Date.now() > this.spotifyKey.expires) await this.getToken();

    if (data.includes('playlist')) return this.getPlaylist(data);

    if (data.includes('track')) return this.getTrack(data);

    if (data.includes('album')) return this.getAlbum(data);

    if (!['playlist', 'track', 'album'].includes(data.toLowerCase())) return [];

  }


  async getToken() {
    const grantPar = new URLSearchParams({ 'grant_type': 'client_credentials' });
    const {
      access_token: accessToken,
      token_type: tokenType,
      expires_in: expiresIn
    } = await fetch(`https://accounts.spotify.com/api/token?${grantPar.toString()}`, {
      method: 'POST',
      headers: this.credentialHeaders
    }).then(res => res.json())

    const now = new Date()
    this.spotifyKey = {
      accessToken,
      tokenType,
      expiresIn,
      expires: new Date(now.getTime() + (expiresIn * 1000))
    };
  }

  get credentialHeaders() {
    const credential = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64')
    return {
      Authorization: `Basic ${credential}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  async getTrack(data) {
    data = data.split('/track/', -1)[1]
    const request = await this.request(`/tracks/${data}`);

    return request.name ? [`${request.name} - ${request.artists[0].name}`] : [];
  }

  async getPlaylist(data, fields = 'fields=items(track(name,artists(name)))') {
    data = data.split('/playlist/', -1)[1];

    const request = await this.request(`/playlists/${data}`, { fields });

    return request.tracks ? request.racks.items.map(r => `${r.name} - ${r.artists[0].name}`) : [];
  }

  async getAlbum(data, limit = 40) {
    data = data.split('/album/', -1)[1];

    const request = await this.request(`/albums/${data}/tracks`, { limit });

    return request.items ? request.items.map(r => `${r.name} - ${r.artists[0].name}`) : [];
  }

  get tokenHeaders() {
    return this.spotifyKey ? { 'Authorization': `${this.spotifyKey.tokenType} ${this.spotifyKey.accessToken}` } : {}
  }

  async request(type) {

    if (!this.spotifyKey || this.spotifyKey && Date.now() > this.spotifyKey.expires) await this.getToken();

    const qParams = new URLSearchParams(type);

    const response = await fetch(`${API_URL}${type}?${qParams}`, {
      headers: this.tokenHeaders
    }).then(res => res.json());

    return response
  }
}