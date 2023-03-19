// variables
const SpotifyWebApi = require('spotify-web-api-node')
const redirectUri = 'https://williewalvis.co.za/spotify/setToken'

// define new web client for interface with spotify
const spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
})

// export the web client
module.exports = spotifyApi