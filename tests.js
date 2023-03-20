// require("../williewalvis/source/api/spotifyHandler").accessTokenRefresher()

require("dotenv").config()
const test = require("./source/spotify/session/resources")
console.log(`initial data look: ${JSON.stringify(test)}`)
test.setRefreshToken("test1")
console.log(`after setting refresh token: ${JSON.stringify(test)}`)
delete test["_credentials"]["refreshToken"]
console.log(`after deleting refresh token: ${JSON.stringify(test)}`)