// endpoint
const Express = require("express")

let base = null
const route = ""

module.exports = {
    Name: "Home Page",
    Description: "Renders a specific page to the request",
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

            // send home page to user
            res.render("home.html", {})

            // force end the function
            return

        } catch (err) {

            // log error and send response
            console.log("Error while rendering, x@213, " + new Date(Date.now()).toString())

            // send to response
            res.send("The server could not respond with a page to load.")

        }

    },

}

// end 