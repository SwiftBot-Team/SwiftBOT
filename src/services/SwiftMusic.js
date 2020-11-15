const { GorilinkPlayer } = require('gorilink');

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const API_URL = 'https://api.spotify.com/v1'

const { get } = require('axios');

module.exports = class SwiftPlayer extends GorilinkPlayer {
  constructor(node, options, manager) {
    super(node, options, manager);

    this.spotifyKey = false;

  };


  async getLyrics() {

    const { KSoftClient } = require('@ksoft/api');

    const ksoft = new KSoftClient(process.env.LYRICS_API);

    try {
      const search = await ksoft.lyrics.search(this.track.info.title);

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
      // const array = [];

      // const music = await client.music.fetchTracks(data);

      // if (music.error) return { type: 'youtube', data: [] };

      // if (music.loadType === 'TRACK_LOADED') {
      //   return { type: 'youtube', data: [music.tracks[0]] }
      // }

      // if (music.loadType === 'LOAD_FAILED') {
      //   return { type: 'youtube', data: [] }
      // }

      // if (music.loadType === 'SEARCH_RESULT') {

      //   return new Promise((r, j) => {
      //     music.tracks.slice(0, 3).forEach(async (track) => {
      //       console.log(track)
      //       const verify = await client.music.fetchTracks(track.info.uri);

      //       if (verify.loadType !== 'LOAD_FAILED' && verify.tracks.length > 0) {
      //         console.log(verify.tracks[0].uri)
      //         return r({ type: 'youtube', data: [verify.tracks[0].uri] })
      //       }
      //     })
      //   })
      // };
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