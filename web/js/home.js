setInterval(() => {
    $.ajax({
        url: "/spotify/getPlayState",
        type: "GET",
        success: async function (result) {
            if (result.data.is_playing) {
                // take away name
                await $('#animated-name').animate({ opacity: 0 }, 300)
                // change visibility
                $('#card-main').animate({ opacity: 1 }, 300)
                // reference data as variable
                let item = result.data.item
                // change image
                $("#image_cover").attr("src", `${item.album.images[0].url}`)
                // change song name and artist name
                $("#song_name").html(`<strong>${item.name}</strong> • ${item.artists[0].name}`)
                // change spotify button uri
                $("#spotify_uri").attr("href", `${item.uri}`)
            } else {
                await $('#card-main').animate({ opacity: 0 }, 300)
                $('#animated-name').animate({ opacity: 1 }, 300)
            }
        },
        error: function (error) {
            console.error(error)
        }
    })
}, 1000)