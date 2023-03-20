// variables
const SpotifyWebApi = require('spotify-web-api-node')
const database = require("../database/connection")

let spotifyApp = new SpotifyWebApi({
    redirectUri: "https://williewalvis.co.za/spotify/setToken",
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
})

let alreadyRunning = false

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
                let url = spotifyApp.createAuthorizeURL(

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
    * Retrieves Spotify playing data from the API and returns.
    * Requires prior authentication before continuing.
    * @returns {Promise<SpotifyApi.CurrentlyPlayingResponse>} Returns object with data from Spotify.
    */
    getMyCurrentPlayingTrack: async () => {

        // return new promise
        return new Promise(async (resolve, reject) => {

            // initiate try catch
            try {

                // get current play state from spotify servers
                spotifyApp.getMyCurrentPlayingTrack().then(

                    // function with data
                    function (data) {

                        // resolve with data
                        return resolve(data.body)

                    },

                    // function with error
                    function (err) {

                        // log the error
                        console.log(err)

                        // throw the error
                        return reject("[SPOTIFY_APP]: Could not complete web request.")

                    }

                ).catch(err => {

                    // log the error
                    console.log(err)

                    // throw error to function
                    return reject("[SPOTIFY_APP]: User is not authenticated, cannot get data.")

                })

            } catch (err) {

                // log the error
                console.error(err)

                // reject the function
                return reject("[SPOTIFY_APP]: Could not complete the function.")

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

                // get the database
                let db = (await (await (new database).connect()).db(process.env.DATABASE_NAME))

                // ! THIS IS THE CASE FOR WHEN THE APP STARTS UP INITIALLY
                if (!onStart || typeof onStart == "undefined") {

                    // use spotify to check the auth code
                    spotifyApp.authorizationCodeGrant(auth).then(

                        // function for data
                        async function (data) {

                            // set spotify api values
                            spotifyApp.setAccessToken(data.body['access_token'])
                            spotifyApp.setRefreshToken(data.body['refresh_token'])

                            // set new access data in database
                            await db.collection("auth").updateOne(

                                // the search parameter
                                { "_id": "spotifyData" },

                                // the new data
                                {

                                    // database function flag
                                    $set: {

                                        // sub division of the document
                                        "accessToken": {

                                            "key": data.body['access_token'],
                                            "expires": data.body['expires_in'],
                                            "retrieved": new Date()

                                        },

                                        "refreshToken": {

                                            "key": data.body['refresh_token'],
                                            "retrieved": new Date()

                                        }

                                    }

                                }

                            )

                            // resolve with void
                            return resolve()

                        },

                        // function with error
                        function (err) {

                            // throw the error out of the function
                            return reject(err)

                        }

                    ).catch(err => {

                        // throw error to function
                        return reject(err)

                    })

                } else {

                    // get the spotify data from the database
                    let spotifyJson = (await db.collection("auth").findOne({ "_id": "spotifyData" }))

                    // check if old access token exists
                    if (spotifyJson["refreshToken"]["key"] != "" && spotifyJson["accessToken"]["key"] != "") {

                        // check if access token exists 
                        if (typeof spotifyApp.getAccessToken() == "undefined") {

                            // set with new access token
                            spotifyApp.setAccessToken(spotifyJson["accessToken"]["key"])

                        }

                        // check if refresh token is set 
                        if (typeof spotifyApp.getRefreshToken() == "undefined") {

                            // set the refresh token
                            spotifyApp.setRefreshToken(spotifyJson["refreshToken"]["key"])

                        }

                        // force run reauthentication
                        spotifyApp.refreshAccessToken().then(

                            // function with data
                            async function (data) {

                                // ! set new access token (ONLY NEED TO WORRY ABOUT THE ACCESS TOKEN)
                                spotifyApp.setAccessToken(data.body['access_token'])

                                // set new credentials in database
                                await db.collection("auth").updateOne(

                                    // the search parameter
                                    { "_id": "spotifyData" },

                                    // the new data
                                    {

                                        // database function flag
                                        $set: {

                                            // sub division of the document
                                            "accessToken": {

                                                "key": data.body['access_token'],
                                                "expires": data.body['expires_in'],
                                                "retrieved": new Date()

                                            }

                                        }

                                    }

                                )

                                // log complete
                                console.log(`[SPOTIFY_APP]: Successfully refreshed @ ${new Date(Date.now()).toLocaleTimeString()}`)

                                // end function
                                return resolve()

                            },

                            // function with error
                            function (err) {

                                // throw error to function
                                return reject("[SPOTIFY_APP]: Could not refresh the access token.")

                            }

                        ).catch(err => {

                            // log could not complete
                            console.log(`[SPOTIFY_APP]: Could not refresh the access token, this happened: \n${err}`)

                        })

                    } else {

                        // throw error
                        return reject("[SPOTIFY_APP]: No old refresh token could be found.")

                    }

                }

            } catch (err) {

                // log error to console
                console.error(err)

                // reject the function
                return reject("[SPOTIFY_APP]: Could not complete the function.")

            }

        })

    },

}

// run check to start refresher
if (!alreadyRunning) {

    // set running
    alreadyRunning = true

    // log that it is running
    console.log("[SPOTIFY_APP]: Running refresher.")

    // run function from the module exports
    setInterval(() => {

        // fun refresher function
        this.authorizationCodeGrant("refreshSequence")
            .then(() => { void 0 })
            .catch(err => { console.log(err) })

    }, 30 * 60000) // 30 minutes

}