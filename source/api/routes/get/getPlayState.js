// endpoint
const Express = require("express")
const SpotifyHandler = require("../../../spotify/funcs")

// base input for passing variables between files
let base = null

// route the user has to go to
const route = "/spotify/getPlayState"

module.exports = {
    Name: "Get Play State",
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

            // run function to set auth token
            SpotifyHandler.getMyCurrentPlayingTrack()

                // function when promise is resolved
                .then(async (data) => {

                    // send response to client
                    res.status(200).json({ data })

                })

                // function when promise is rejected
                .catch(async (err) => {

                    // send response to client
                    res.status(400).json({

                        "status": "error",
                        "message": "There was a problem while getting the current playing track.",

                    })

                })

        } catch (err) {

            // log error and send response
            console.log("Error while running, x@214, " + new Date(Date.now()).toString())

            // send to response
            // send response to client
            res.status(400).json({

                "status": "error",
                "message": "The server could not provide a response.",

            })

        }

    },

}

// end 