let currentSong_Name = ""

setInterval(() => {
    $.ajax({
        url: "/spotify/getPlayState",
        type: "GET",
        success: async function (result) {
            if (result.data.is_playing) {
                // reference data as variable
                let item = result.data.item
                // take away name
                await $('#animated-name').animate({ opacity: 0 }, 100)
                await $('#motd').animate({ opacity: 0 }, 100)
                if (currentSong_Name !== item.name) {
                    // new song started
                    $('#card-main').animate({ opacity: 0 }, 100)
                    // change image
                    $("#image_cover").attr("src", `${item.album.images[0].url}`)
                    // change song name and artist name
                    $("#song_name").html(`<strong>${item.name}</strong> • ${item.artists[0].name}`)
                    // change spotify button uri
                    $("#spotify_uri").attr("href", `${item.uri}`)
                    // do some stuffs
                    $('#card-main').animate({ opacity: 1 }, 100)
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
            } else {
                await $('#card-main').animate({ opacity: 0 }, 100)
                $('#animated-name').animate({ opacity: 1 }, 300)
                $('#motd').animate({ opacity: 1 }, 300)
            }
        },
        error: function (error) {
            console.error(error)
        }
    })
}, 1000)