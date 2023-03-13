// variables
const express = require('express')
const pretty = require("express-prettify")
const ip = require("express-ip")

const spotifyHandler = require("./spotifyHandler")

const app = express()

const path = require('path')
const fs = require('fs')

const port = process.env.PORT

// set app middlwares
app.use(pretty({ always: true }))
app.use(express.static(path.join(__dirname, '../web')))
app.engine('html', require('ejs').renderFile)
app.set("view-engine", "html")
app.set("views", path.join(__dirname, "../web/html"))
app.use(ip().getIpInfoMiddleware)

// app get requests
const GetEndpointFiles = fs
    .readdirSync(path.join(__dirname, "./routes/get"))
    .filter((File) => File.endsWith(".js"))
for (const File of GetEndpointFiles) {
    const Endpoint = require(`./routes/get/${File}`)
    app.get(Endpoint.AccessPoint, async (request, response) => {
        await Endpoint.Initialize({ inUse: false })
        await Endpoint.Function(request, response)
    })
}

// app post requests
const PostEndpointFiles = fs
    .readdirSync(path.join(__dirname, "./routes/post"))
    .filter((File) => File.endsWith(".js"))
for (const File of PostEndpointFiles) {
    const Endpoint = require(`./routes/post/${File}`)
    app.post(Endpoint.AccessPoint, async (request, response) => {
        await Endpoint.Initialize({ inUse: false })
        await Endpoint.Function(request, response)
    })
}

// use protected routes
app.use((req, res, next) => {

    // redirect to home page
    res.redirect('/')

})

// listen app
app.listen(port, async () => { 
    
    // log web app status
    console.log(`Web Online @ ${port}`) 
    
    // wrap in try catch block
    await spotifyHandler.authorizationCodeGrant("onStart", true) 
    
    	// catch any errors that might happen
    	.catch(err, () => { return })
    
})