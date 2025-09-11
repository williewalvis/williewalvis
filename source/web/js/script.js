// HOME PAGE TEXT FOLLOWER ANIMATION
window.addEventListener('mousemove', handleMouseMove)
window.addEventListener('resize', handleWindowResize)

const spansSlow = document.querySelectorAll('.spanSlow')
const spansFast = document.querySelectorAll('.spanFast')

let width = window.innerWidth;

function handleMouseMove(e) {
  let normalizedPosition = e.pageX / (width / 2) - 1
  let speedSlow = 100 * normalizedPosition
  let speedFast = 200 * normalizedPosition
  spansSlow.forEach((span) => {
    span.style.transform = `translate(${speedSlow}px)`;
  })
  spansFast.forEach((span) => {
    span.style.transform = `translate(${speedFast}px)`
  })
}
//we need to recalculate width when the window is resized
function handleWindowResize() {
  width = window.innerWidth
}

// TRANSITION EFFECT BETWEEN PAGES
let slide_time = 1200
let change_point = slide_time / 2

let current_slide = 1
let on = 1

let transitionsSet = new Set([
  {
    button: $('.transition_button_trigger_home'),
    slide: $('#home_section_transition'),
    page: "Home"
  },
  {
    button: $('.transition_button_trigger_work'),
    slide: $('#work_section_transition'),
    page: "Work"
  },
  {
    button: $('.transition_button_trigger_contact'),
    slide: $('#contact_section_transition'),
    page: "Contact"
  }
])

// set button functions for transitions
transitionsSet.forEach((transition) => {

  // set click function for buttons
  transition.button.click(async () => {

    // define new promise
    let promise = new Promise((resolve, reject) => {

      // check if already running
      if (on == 1) {

        // debounce value
        on = 0

        // set active
        let active_slide = transition.slide

        // set transition
        set_transition(active_slide)

        // set timeout to hide current slide & bring in new slide
        setTimeout(() => {

          $('.active_slide').hide().removeClass('active_slide')

          active_slide.addClass('active_slide').show()

        }, change_point)

        // set timeout to reset debounce value
        setTimeout(() => {

          on = 1;

        }, slide_time)

        // set timeout to resolve promise for document reset
        setTimeout(() => { resolve() }, 500)

      }

    })

    // check for promise finish
    // promise.then(() => { $('#menu-icon').prop('checked', false); $(document).prop('title', `WillieWalvis • ${transition.page}`) }) //! STOP SHOWING THE DOCUMENT TITLE

  })

})

// Set transition type
function set_transition(tran) {

  let transition_type = tran.data('transition')

  $('.easytransitions_transition div').each(function () {

    $(this).removeClass(this.className.split(' ').pop())

    setTimeout(function () {

      $('.easytransitions_transition div').addClass(transition_type)

    }, 100)

  })

}

// logical operator for websocket system
let opacityShowing = false

// define the timeline width
let timelineWidth = $("#slider").width() - $("#elapsed").width()

// do some websocket based stuff, very important
if ("WebSocket" in window) {

  // define the socket connection
  let ws = new WebSocket("wss://socket.malherbes.co/")

  // add function to socket opening
  ws.onopen = () => {

    // send the spotify init command
    ws.send("SPOTIFY|RETRIEVE")

  }

  // handle the the spotify data
  ws.onmessage = (event) => {

    // wrap in try catch
    try {

      // define the data
      let received_msg = JSON.parse(event.data)

      // define the data
      let is_playing = received_msg["is_playing"]

      // check if playing
      if (is_playing) {

        // define all the data variables
        let artist_name = received_msg["item"]["album"]["artists"][0]["name"]
        let album_name = received_msg["item"]["album"]["name"]
        let album_image = received_msg["item"]["album"]["images"][0]["url"]
        let song_name = received_msg["item"]["name"]
        let song_progress = received_msg["progress_ms"]
        let song_duration = received_msg["item"]["duration_ms"]
        let song_uri = received_msg["item"]["uri"]

        // do length checks on all data that is necessary
        if (song_name.length > 20) { song_name = song_name.substring(0, 20) + "..." }
        if (artist_name.length > 20) { artist_name = artist_name.substring(0, 20) + "..." }
        if (album_name.length > 25) { album_name = album_name.substring(0, 25) + "..." }

        // set spotify redirect button uri
        $("#spotify_redirect").attr("href", song_uri)

        // set the data
        $("#album_image").attr("src", album_image)
        $("#song_name").text(song_name)
        $("#artist_name").text(artist_name)
        $("#album_name").text(album_name)

        // set the progress bar data
        let progressPercent = timelineWidth * (song_progress / song_duration)
        $("#elapsed").css('width', progressPercent + "px")
        let timeDifference = new Date(song_duration - song_progress)
        let minutes = timeDifference.getMinutes()
        let seconds = timeDifference.getSeconds()
        if (seconds < 10) { $("#timer").text(`${minutes}:0${seconds}`) }
        else { $("#timer").text(`${minutes}:${seconds}`) }

        // check if player card is already showing
        if (!opacityShowing) {

          // set opacity showing to true
          opacityShowing = true

          // set opacity to 1 with jquery animation
          $("#player_card").animate({ opacity: 1 }, 500)

        }

      } else {

        // check if opacity is 0 already
        if (opacityShowing) {

          // set opacity showing to false
          opacityShowing = false

          // set opacity to 0 with jquery animation
          $("#player_card").animate({ opacity: 0 }, 500)

        }

      }

    } catch (err) {

      // check if opacity is 0 already
      if (opacityShowing) {

        // set opacity showing to false
        opacityShowing = false

        // set opacity to 0 with jquery animation
        $("#player_card").animate({ opacity: 0 }, 500)

      }

      // just end this rendition
      return

    }

  }

  // check if websocket errored
  ws.onerror = () => {

    // check if opacity is 0 already
    if (opacityShowing) {

      // set opacity showing to false
      opacityShowing = false

      // set opacity to 0 with jquery animation
      $("#player_card").animate({ opacity: 0 }, 500)

    }

  }

  // if it closes make opacity of spotify card 0 with jquery animation
  ws.onclose = () => {

    // check if opacity is 0 already
    if (opacityShowing) {

      // set opacity showing to false
      opacityShowing = false

      // set opacity to 0 with jquery animation
      $("#player_card").animate({ opacity: 0 }, 500)

    }

  }

}