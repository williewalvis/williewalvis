// variables
const SpotifyWebApi = require('spotify-web-api-node')
const redirectUri = 'https://williewalvis.co.za/spotify/setToken'

const spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
})

const path = require("path")

const editjsonfile = require("edit-json-file")
const spotifyJson = editjsonfile(path.join(__dirname, "../database/spotify.json"))

let loggedIn = false

// module exports
module.exports = {

    /**
     * @Internal
     * Creates a authorization URL that Spotify uses to identify the Web App.
     * If successfully returned, then the app will be granted access to accounts.
     * @returns {Promise<String>} Returns the URL string.
     */
    createAuthorizeURL: async () => {

        // return new promise
        return new Promise(async (resolve, reject) => {

            // initiate try catch
            try {

                // define url string
                let url = spotifyApi.createAuthorizeURL(

                    // scopes to get for, to read data
                    [

                        'user-read-private',
                        'user-read-email',
                        'user-read-playback-state',
                        'user-read-currently-playing'

                    ],

                    // the state code, on the Spotify app
                    "musix"

                )

                // resolve with url
                return resolve(url)

            } catch (err) {

                // log the error
                console.log(err)

                // reject the function
                return reject("Could not complete the function.")

            }

        })

    },

    /**
     * @Internal
     * Creates a authorization URL that Spotify uses to identify the Web App.
     * If successfully returned, then the app will be granted access to accounts.
     * @param {String} auth The authorization code that is returned by Spotify to access private data.
     * @returns {Promise<String>} Returns the URL string.
     */
    authorizationCodeGrant: async (auth) => {

        // return new promise
        return new Promise(async (resolve, reject) => {

            // initiate try catch
            try {

                // use spotify to check the auth code
                spotifyApi.authorizationCodeGrant(auth).then(

                    function (data) {

                        // set logged in boolean
                        loggedIn = true

                        // set spotify api values
                        spotifyApi.setAccessToken(data.body['access_token'])
                        spotifyApi.setRefreshToken(data.body['refresh_token'])

                        // set new credentials in file
                        spotifyJson.set("accessToken", data.body['access_token'])
                        spotifyJson.set("refreshToken", data.body['refresh_token'])
                        spotifyJson.save()

                        // return some json data fam
                        res.status(200).json({
                            tokenExpiry: data.body['expires_in'],
                            accessToken: data.body['access_token'],
                            refreshToken: data.body['refresh_token']
                        })

                    },

                    function (err) {
                        res.status(200).json({ err })
                    }

                )

            } catch (err) {

                // log the error
                console.log(err)

                // reject the function
                return reject("Could not complete the function.")

            }

        })

    },

    getMyCurrentPlayingTrack: async () => {

        // return new promise
        return new Promise(async (resolve, reject) => {

            // initiate try catch
            try {



            } catch (err) {

                // log the error
                console.log(err)

                // reject the function
                return reject("Could not complete the function.")

            }

        })

    }

}