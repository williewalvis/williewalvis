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
    promise.then(() => { $('#menu-icon').prop('checked', false); $(document).prop('title', `WillieWalvis • ${transition.page}`) })
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