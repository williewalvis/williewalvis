// initialise the environment
require('dotenv').config()

// set public dir



// web app homepage

app.get('/', async (req, res, next) => {
    // render main page
    res.render("home.html")
    // end function 
    return
}) // ! REMEMBER TO ADD AUTH MIDDLEWARE AGAIN; ALSO REWORK THE SPOTIFY INTEGRATION, IT IS SHIT

// spotify based stuff

app.get('/spotify/setAccount', async (req, res) => {
    if (req.query.user == "williewalvis") {
        let authUrl = spotifyApi.createAuthorizeURL(scopes, state)
        res.redirect(authUrl)
    } else {
        res.redirect('/')
    }
})

app.get('/spotify/setToken', async (req, res) => {
    if (req.query.code) {
        let authToken = req.query.code
        spotifyApi.authorizationCodeGrant(authToken).then(
            function (data) {
                // set logged in boolean
                loggedIn = true
                // set spotify api values
                spotifyApi.setAccessToken(data.body['access_token'])
                spotifyApi.setRefreshToken(data.body['refresh_token'])
                // set new credentials in file
                spotifyJson.set("accessToken", data.body['access_token'])
                spotifyJson.set("refreshToken", data.body['refresh_token'])
                spotifyJson.save()
                // return some json data fam
                res.status(200).json({
                    tokenExpiry: data.body['expires_in'],
                    accessToken: data.body['access_token'],
                    refreshToken: data.body['refresh_token']
                })
            },
            function (err) {
                res.status(200).json({ err })
            }
        )
    } else {
        res.redirect('/')
    }
})

app.get('/spotify/getPlayState', async (req, res) => {
    spotifyApi.getMyCurrentPlayingTrack()
        .then(function (data) {
            res.status(200).json({
                data: data.body
            })
        }, function (err) {
            res.status(200).json({ err })
        })
})

// reset spotify access grant

setInterval(() => {
    if (loggedIn) {
        console.log("refreshing spotify")
        spotifyApi.refreshAccessToken().then(
            function (data) {
                spotifyApi.setAccessToken(data.body['access_token'])
                // set new credentials in file
                spotifyJson.set("accessToken", data.body['access_token'])
                spotifyJson.save()
            },
            function (err) {
                console.log("error refreshing spotify")
                console.error(err)
            }
        )
    } else {
        console.log("not refreshing spotify")
    }
}, 2400000) // 40 minutes 

// check if access token exists for spotify

async function doSpot() {
    if (spotifyJson.get("accessToken") !== "") {
        console.log("trying to use old access token")
        // set credentials
        spotifyApi.setAccessToken(spotifyJson.get("accessToken"))
        spotifyApi.setRefreshToken(spotifyJson.get("refreshToken"))
        // do a check to confirm
        spotifyApi.getMyCurrentPlayingTrack()
            .then(function (data) {
                console.log("spotify has successfully authenticated")
                spotifyApi.refreshAccessToken().then(
                    function (data) {
                        spotifyApi.setAccessToken(data.body['access_token'])
                        // set new credentials in file
                        spotifyJson.set("accessToken", data.body['access_token'])
                        spotifyJson.save()
                        // spotify is logged in
                        loggedIn = true
                    },
                    function (err) {
                        console.log("error refreshing spotify")
                        console.error(err)
                    }
                )
            }, function (err) {
                console.log("access token has expired \nmanual login required")
                console.error(err)
            })
    } else {
        console.log("no existing access token")
        console.log("need manual login")
    }
}

doSpot()

// app middleware

function checkAuth(req, res, next) {
    if (!loggedIn) {
        if (process.env.DEV !== "YES") {
            res.redirect("https://www.instagram.com/williewalvis/")
        }
    } else {
        next()
    }
}

// have daemon become calm  

console.log("[PT_DAEMON] Done!")
