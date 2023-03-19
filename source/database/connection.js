// variables
const mongodb = require("mongodb")

// constructor
class MongoConnection {

    constructor() {

        // set backend
        this.host = process.env.DATABASE_HOST
        this.port = process.env.DATABASE_PORT || 27017
        this.username = process.env.DATABASE_USERNAME
        this.password = process.env.DATABASE_PASSWORD
        this.name = process.env.DATABASE_NAME

        // boolean values
        this.connected = false

        // setup connection
        this.connection = new mongodb.MongoClient(
            `mongodb://${this.username}:${this.password}@${this.host}:${this.port}/${this.name}`
        )

    }

    /**
     * @returns {mongodb.MongoClient} MongoDB Client instance.
     */
    async connect() {

        return new Promise((resolve, reject) => {

            // connect instance and return
            this.connection

                .connect()

                .then((client) => {

                    // check boolean values
                    if (this.connected) {

                        // throw error
                        return reject("Already connected.")

                    } else {

                        // set boolean values
                        this.connected = true

                        // give connection
                        return resolve(client)

                    }

                })

                .catch((err) => {

                    // check error
                    if (err) {

                        // log error
                        console.log(err)

                    }

                })

        })

    }

    /**
     * @returns {Boolean} Operation status.
     */
    async close() {

        return new Promise((resolve, reject) => {

            // check if connected
            if (this.connected) {

                // close instance
                this.connection

                    .close()

                    .then(() => {

                        // set boolean
                        this.connection = false

                        // end function
                        return resolve(true)

                    })

                    .catch((err) => {

                        // check error
                        if (err) {

                            // log error
                            console.log(err)

                        }

                    })

            } else {

                // error
                reject("Trying to close non-existant instance.")

            }

        })

    }

}

// export the mongo connection
module.exports = MongoConnection