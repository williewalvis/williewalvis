// endpoint
const Express = require("express")

let base = null
const route = ":name"

module.exports = {
    Name: "Go To Page",
    Description: "Forwards a request to an outbound URL",
    AccessPoint: `/${route}`,
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

            // check the parameters to see where to go
            if (req.params.name.toLowerCase() == "bella" && req.query.key == process.env.BELLA_KEY) {

                // forward request to corrosponding page
                res.redirect(process.env.BELLA_URL)

            } else {
                
                res.send("No page found.")
                
            }

        } catch (err) {

            // log error and send response
            console.log("Error while rendering, x@213, " + new Date(Date.now()).toString())

            // send to response
            res.send("The server could not respond with a page to load.")

        }

    },

}

// end 