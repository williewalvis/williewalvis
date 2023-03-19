// endpoint
const Express = require("express")
const SpotifyHandler = require("../../../spotify")

// base input for passing variables between files
let base = null

// route the user has to go to
const route = "/spotify/setAccount"

module.exports = {
    Name: "Set Account",
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

            // check if user is in query
            if (req.query.user && req.query.user == process.env.SPOTIFYACCOUNT) {

                // run function to set auth token
                SpotifyHandler.createAuthorizeURL()

                    // function when promise is resolved
                    .then(async (redir) => {

                        // send response to client
                        res.redirect(redir)

                    })

                    // function when promise is rejected
                    .catch(async (err) => {

                        // send response to client
                        res.send("There was a problem while creating the link.")

                    })

            } else {

                // send response to client
                res.send("No identification was provided for this request.")

            }

        } catch (err) {

            // log error and send response
            console.log("Error while running, x@214, " + new Date(Date.now()).toString())

            // send to response
            res.send("The server could not respond.")

        }

    },

}

// end 