// variables
const database = require("../database/connection")

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

                // define spotify api instance
                let spotifyApi = require("./session/resources")

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

                // get the database
                let db = (await (await (new database).connect()).db(process.env.DATABASE_NAME))

                // define spotify api instance
                let spotifyApi = require("./session/resources")

                // check if first time/initial run
                if (!onStart || typeof onStart == "undefined") {

                    // use spotify to check the auth code
                    spotifyApi.authorizationCodeGrant(auth).then(

                        // function for data
                        async function (data) {

                            // set spotify api values
                            spotifyApi.setAccessToken(data.body['access_token'])
                            spotifyApi.setRefreshToken(data.body['refresh_token'])

                            // set new access data in database
                            await db.collection("auth").updateOne(

                                // the search parameter
                                { "_id": "spotifyData" },

                                // the new data
                                {

                                    // database function flag
                                    $set: {

                                        // sub division of the document
                                        "data": {

                                            "accessToken": data.body['access_token'],
                                            "refreshToken": data.body['refresh_token']

                                        },

                                        // set lastaccessed
                                        "lastAccessed": new Date()

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
                    let spotifyJson = (await db.collection("auth").findOne({ "_id": "spotifyData" })).data

                    // check if old access token exists
                    if (spotifyJson["refreshToken"] != "") {

                        // log current status
                        console.log("Trying to use old refresh token to set Spotify API Credentials.")

                        // ! set refresh token (REFRESH TOKENS DO NOT EXPIRE AT ALL; NEED TO EXPLICITLY DISCONNECT)
                        spotifyApi.setRefreshToken(spotifyJson["refreshToken"])

                        // force run reauthentication
                        spotifyApi.refreshAccessToken().then(

                            // function with data
                            async function (data) {

                                // ! set new access token (ONLY NEED TO WORRY ABOUT THE ACCESS TOKEN)
                                spotifyApi.setAccessToken(data.body['access_token'])

                                // set new credentials in database
                                await db.collection("auth").updateOne(

                                    // the search parameter
                                    { "_id": "spotifyData" },

                                    // the new data
                                    {

                                        // database function flag
                                        $set: {

                                            // sub division of the document
                                            "data.accessToken": data.body['access_token'],

                                            // set lastaccessed
                                            "lastAccessed": new Date()

                                        }

                                    }

                                )

                                // log complete
                                console.log("Successfully used old refresh token to set Spotify API Credentials.")

                                // end function
                                return resolve()

                            },

                            // function with error
                            function (err) {

                                // throw error to function
                                return reject("Could not successfully authenticate, manual required.")

                            }

                        ).catch(err => {

                            // log could not complete
                            console.log("Could not use old refresh token, please manually re-login to your account.")

                        })

                    } else {

                        // throw error
                        return reject("No old refresh token could be found.")

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

                // define spotify api instance
                let spotifyApi = require("./session/resources")

                // get current play state from spotify servers
                spotifyApi.getMyCurrentPlayingTrack().then(

                    // function with data
                    function (data) {

                        // resolve with data
                        return resolve(data.body)

                    },

                    // function with error
                    function (err) {

                        // log this error
                        console.log(err)

                        // throw the error
                        return reject("Could not complete web request.")

                    }

                ).catch(err => {

                    // throw error to function
                    return reject("User is not authenticated, cannot get data.")

                })

            } catch (err) {

                // log the error
                console.error(err)

                // reject the function
                return reject("Could not complete the function.")

            }

        })

    },

}