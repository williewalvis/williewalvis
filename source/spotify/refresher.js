// variables
let SpotifyHandler = require("./index")

// define module exports
module.exports = () => {

    // log that refresher starting
    console.log("[REFRESHER] Starting refresher.")

    // define refresher
    setInterval(async () => {

        // log refresh and time
        console.log("[REFRESHER] Refreshing token at " + new Date().toLocaleTimeString())

        // run the authenticate function
        await SpotifyHandler.authorizationCodeGrant("onRefresh", true)
            .then(() => { void 0 })
            .catch((err) => { console.log(err) })

        // log complete refresh
        console.log("[REFRESHER] Refresh complete.")

    }, 1800000) // * 30 MINUTES

}