const { GorilinkPlayer } = require('gorilink');

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const API_URL = 'https://api.spotify.com/v1'

module.exports = class SwiftPlayer extends GorilinkPlayer {
  constructor(node, options, manager) {
    super(node, options, manager);

    this.spotifyKey = false;

  };



  async getType(data) {
    if (data.includes('spotify')) return {
      type: 'spotify', data: await this.getSpotifyMusic(data)
    };

    else return { type: 'youtube', data: [data] }
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
    return request.name ? [request.name] : [];
  }

  async getPlaylist(data, fields = 'fields=items(track(name,artists(name)))') {
    data = data.split('/playlist/', -1)[1];

    const request = await this.request(`/playlists/${data}`, { fields });

    return request.tracks ? request.tracks.items.map(r => r.track.name) : [];
  }

  async getAlbum(data, limit = 40) {
    data = data.split('/album/', -1)[1];

    const request = await this.request(`/albums/${data}/tracks`, { limit });

    return request.items ? request.items.map(r => r.name) : [];
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