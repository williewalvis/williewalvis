let currentSong_Name = ""
let alreadyGone = false

setInterval(() => {
    $.ajax({
        url: "/spotify/getPlayState",
        type: "GET",
        success: async function (result) {
            if (result.data.is_playing) {
                // reference data as variable
                let item = result.data.item
                // main function
                function updateScreen() {
                    // NOT THE SAME SONG
                    if (currentSong_Name !== item.name) {
                        // new song started
                        $('#card-main').animate({ opacity: 0 }, {
                            duration: 200,
                            complete: function () {
                                // change image
                                $("#image_cover").attr("src", `${item.album.images[0].url}`)
                                // change song name and artist name
                                $("#song_name").html(`<strong>${item.name}</strong> • ${item.artists[0].name}`)
                                // change spotify button uri
                                $("#spotify_uri").attr("href", `${item.uri}`)
                                // do some stuffs
                                $('#card-main').animate({ opacity: 1 }, 200)
                            }
                        })
                        // set name variable
                        currentSong_Name = item.name
                    } else {
                        // change visibility
                        $('#card-main').animate({ opacity: 1 }, 300)
                        // change image
                        $("#image_cover").attr("src", `${item.album.images[0].url}`)
                        // change song name and artist name
                        $("#song_name").html(`<strong>${item.name}</strong> • ${item.artists[0].name}`)
                        // change spotify button uri
                        $("#spotify_uri").attr("href", `${item.uri}`)
                        // set name variable
                        currentSong_Name = item.name
                    }
                }
                // main thing
                if (alreadyGone) {
                    updateScreen()
                } else {
                    // take away name
                    alreadyGone = true
                    currentSong_Name = item.name
                    $('#motd').animate({ opacity: 0 }, 200)
                    $('#animated-name').animate({ opacity: 0 }, {
                        duration: 300,
                        complete: function () {
                            updateScreen()
                        }
                    })
                }
            } else {
                alreadyGone = false
                $('#card-main').animate({ opacity: 0 }, {
                    duration: 300,
                    complete: function () {
                        $('#animated-name').animate({ opacity: 1 }, 300)
                        $('#motd').animate({ opacity: 1 }, 300)
                    }
                })
            }
        },
        error: function (error) {
            console.error(error)
        }
    })
}, 2000)