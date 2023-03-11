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
                console.error(err)

                // reject the function
                return reject("Could not complete the function.")

            }

        })

    },

    /**
     * @Internal
     * Syncs the Spotify API with the Web App, which allows access to data.
     * If successfully returned, then the app will be granted access to accounts.
     * @param {String} auth The authorization code that is returned by Spotify to access private data.
     * @param {Boolean} onStart Parameter to determine if should check for initial data without having to force login.
     * @returns {Promise<void>} Returns nothing, just resolves.
     */
    authorizationCodeGrant: async (auth, onStart) => {

        // return new promise
        return new Promise(async (resolve, reject) => {

            // initiate try catch
            try {

                // check if first time/initial run
                if (!onStart || typeof onStart == "undefined") {

                    // use spotify to check the auth code
                    spotifyApi.authorizationCodeGrant(auth).then(

                        // function for data
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

                            // resolve with void
                            return resolve()

                        },

                        // function with error
                        function (err) {

                            // throw the error out of the function
                            throw new Error(err)

                        }

                    )

                } else {

                    // check if old access token exists
                    if (spotifyJson.get("accessToken") !== "") {

                        // log current status
                        console.log("Trying to use old access token to set Spotify API Credentials.")

                        // set credentials
                        spotifyApi.setAccessToken(spotifyJson.get("accessToken"))
                        spotifyApi.setRefreshToken(spotifyJson.get("refreshToken"))

                        // do a check to confirm
                        spotifyApi.getMyCurrentPlayingTrack().then(

                            // function with data
                            function (data) {

                                // log current short status
                                console.log("Spotify has successfully sub-authenticated.")

                                // force run reauthentication
                                spotifyApi.refreshAccessToken().then(

                                    // function with data
                                    function (data) {

                                        // set new access token
                                        spotifyApi.setAccessToken(data.body['access_token'])

                                        // set new credentials in file
                                        spotifyJson.set("accessToken", data.body['access_token'])
                                        spotifyJson.save()

                                        // spotify is logged in
                                        loggedIn = true

                                        // end function
                                        return resolve()

                                    },

                                    // function with error
                                    function (err) {

                                        console.log("error refreshing spotify")
                                        console.error(err)

                                    }

                                )

                            },

                            // function with error
                            function (err) {

                                // log current status and error
                                console.log("Access token has expired. \nManual login is required to make use of function subset. \nLogged @ " + new Date(Date.now()).toString())

                            }

                        )

                    } else {

                        // throw error
                        throw new Error("No old access token could be found.")

                    }

                }

            } catch (err) {

                // log error to console
                console.error(err)

                // reject the function
                return reject("Could not complete the function.")

            }

        })

    },

    /**
    * @Internal
    * Retrieves Spotify playing data from the API and returns.
    * Requires prior authentication before continuing.
    * @returns {Promise<SpotifyApi.CurrentlyPlayingResponse>} Returns object with data from Spotify.
    */
    getMyCurrentPlayingTrack: async () => {

        // return new promise
        return new Promise(async (resolve, reject) => {

            // initiate try catch
            try {

                // check if logged in
                if (loggedIn) {

                    // get current play state from spotify servers
                    spotifyApi.getMyCurrentPlayingTrack().then(

                        // function with data
                        function (data) {

                            // resolve with data
                            return resolve(data.body)

                        },

                        // function with error
                        function (err) {

                            // throw the error
                            throw new Error(err)

                        }

                    )

                } else {

                    // throw error
                    throw new Error("User is not logged in, cannot retrieve data.")

                }

            } catch (err) {

                // log the error
                console.error(err)

                // reject the function
                return reject("Could not complete the function.")

            }

        })

    },

    /**
    * @Internal
    * Starts the AccessToken refresher for continuous data access.
    * Requires prior authentication before continuing.
    * @returns {void} Returns nothing, just refreshes.
    */
    accessTokenRefresher: async () => {

        // initiate try catch
        try {

            // interval based function
            setInterval(async () => {

                // check if logged in
                if (loggedIn) {

                    // log current status
                    console.log("Starting refresh, user is logged in.")

                    // run refresh access token from spotify
                    spotifyApi.refreshAccessToken().then(

                        // function with data
                        function (data) {

                            // set internal spotify api token
                            spotifyApi.setAccessToken(data.body['access_token'])

                            // set new credentials in file
                            spotifyJson.set("accessToken", data.body['access_token'])
                            spotifyJson.save()

                            // log current state
                            console.log("Successfully refreshed Spotify login @ " + new Date(Date.now()).toString())

                        },

                        // function with error
                        function (err) {

                            // log the error
                            console.error("There was an error: \n\n" + err)

                        }

                    )

                } else {

                    // log error to console
                    console.error("Could not refresh, user is not logged in.")

                }

            }, 2400000) //  run every 40 minutes

        } catch (err) {

            // log the error
            console.error(err)

        }

    }

}