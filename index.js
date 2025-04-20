// initialise the environment
require('dotenv').config()

// variables
let { Worker } = require('worker_threads')

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
