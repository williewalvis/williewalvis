// initialise the environment
require('dotenv').config()

// variables
let { Worker } = require('worker_threads')
let SpotifyHandler = require('./source/spotify')

// define worker threads
let startAPI = () => {

    // define API worker
    module.API = new Worker("./source/api/index.js", { env: process.env })

    // listen for process exit and restart
    module.API.on("exit", (err) => {

        // log error for debugging
        console.log(err)

        // restart the app
        startAPI()

    })

}

// start processes
startAPI()

// status code for pterodactyl daemon
console.log("[PT_DAEMON] Finished sync, calm down.")

// log that refresher starting
console.log("[REFRESHER] Starting refresher.")

// define refresher
setInterval(async () => {

    // log refresh and time
    console.log("[REFRESHER] Refreshing token at " + new Date().toLocaleTimeString())

    // run the authenticate function
    await SpotifyHandler.authorizationCodeGrant("onRefresh", true)
        .then(() => { void 0 })
        .catch((error) => { void error })

    // log complete refresh
    console.log("[REFRESHER] Refresh complete.")

}, 120000/2) // * 30 MINUTES