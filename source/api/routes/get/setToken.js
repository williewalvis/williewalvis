// endpoint
const Express = require("express")
const SpotifyHandler = require("../../../spotify")

// base input for passing variables between files
let base = null

// route the user has to go to
const route = "/spotify/setToken"

module.exports = {
    Name: "Set Token",
    Description: "This is an API endpoint, designed to run a specific function.",
    AccessPoint: `${route}`,
    Initialize: async (Input) => {
        base = Input
    },
    /**
     * Internal JSDoc for the sanity of my brain.
     * @param {Express.Request} req The request object from Express.
     * @param {Express.Response} res The response object from Express.
     * @returns {void} Returns nothing to internal server, only sent to client.
     */
    Function: async (req, res) => {

        // initiate try catch
        try {

            // check if code in query
            if (req.query.code) {

                // run function to set auth token
                SpotifyHandler.authorizationCodeGrant(req.query.code)

                    // function when promise is resolved
                    .then(async () => {

                        // send response to client
                        res.send("[SPOTIFY_MANUAL_SET]: Successfully authenticated.")

                    })

                    // function when promise is rejected
                    .catch(async (err) => {

                        // send response to client
                        res.send("[SPOTIFY_MANUAL_SET]: There was a problem while authenticating.")

                    })

            } else {

                // send response to client
                res.send("[SPOTIFY_MANUAL_SET]: No authentication was provided for this request.")

            }

        } catch (err) {

            // log error and send response
            console.log("[SPOTIFY_MANUAL_SET]: Error while running, x@214, " + new Date(Date.now()).toString())

            // send to response
            res.send("[SPOTIFY_MANUAL_SET]: The server could not respond.")

        }

    },

}

// end 