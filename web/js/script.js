// HOME PAGE TEXT FOLLOWER ANIMATION

window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('resize', handleWindowResize);

const spansSlow = document.querySelectorAll('.spanSlow');
const spansFast = document.querySelectorAll('.spanFast');

let width = window.innerWidth;

function handleMouseMove(e) {
  let normalizedPosition = e.pageX / (width / 2) - 1;
  let speedSlow = 100 * normalizedPosition;
  let speedFast = 200 * normalizedPosition;
  spansSlow.forEach((span) => {
    span.style.transform = `translate(${speedSlow}px)`;
  });
  spansFast.forEach((span) => {
    span.style.transform = `translate(${speedFast}px)`
  })
}
//we need to recalculate width when the window is resized
function handleWindowResize() {
  width = window.innerWidth;
}

// TRANSITION EFFECT BETWEEN PAGES

let slide_time = 1200;
let change_point = slide_time / 2;

let home_button = $('.transition_button_trigger_home');
let work_button = $('.transition_button_trigger_work');
let contact_button = $('.transition_button_trigger_contact');

let current_slide = 1;
let on = 1;

home_button.click(async function () {
  if (on == 1) {
    on = 0;
    if (current_slide != 1) {
      let promise = new Promise(async (resolve, reject) => {
        current_slide = 1;
        let active_slide = $('#home_section_transition')
        set_transition(active_slide);
        setTimeout(function () {
          $('.active_slide').hide().removeClass('active_slide');
          $('#home_section_transition').addClass('active_slide').show();
        }, change_point);
        setTimeout(function () {
          on = 1;
        }, slide_time);
        setTimeout(() => { resolve() }, 500);
      })
      promise.then(() => { $('#menu-icon').prop('checked', false); $(document).prop('title', 'WillieWalvis • Home') })
    }
  }
});

work_button.click(async function () {
  if (on == 1) {
    on = 0;
    if (current_slide != 2) {
      let promise = new Promise(async (resolve, reject) => {
        current_slide = 2;
        let active_slide = $('#work_section_transition')
        set_transition(active_slide);
        setTimeout(function () {
          $('.active_slide').hide().removeClass('active_slide');
          $('#work_section_transition').addClass('active_slide').show();
        }, change_point);
        setTimeout(function () {
          on = 1;
        }, slide_time);
        setTimeout(() => { resolve() }, 500);
      })
      promise.then(() => { $('#menu-icon').prop('checked', false); $(document).prop('title', 'WillieWalvis • Work') })
    }
  }
});

contact_button.click(async function () {
  if (on == 1) {
    on = 0;
    if (current_slide != 3) {
      let promise = new Promise(async (resolve, reject) => {
        current_slide = 3;
        let active_slide = $('#contact_section_transition')
        set_transition(active_slide);
        setTimeout(function () {
          $('.active_slide').hide().removeClass('active_slide');
          $('#contact_section_transition').addClass('active_slide').show();
        }, change_point);
        setTimeout(function () {
          on = 1;
        }, slide_time);
        setTimeout(() => { resolve() }, 500);
      })
      promise.then(() => { $('#menu-icon').prop('checked', false); $(document).prop('title', 'WillieWalvis • Contact') })
    }
  }
});

// Set transition type

function set_transition(tran) {
  let transition_type = tran.data('transition')
  $('.easytransitions_transition div').each(function () {
    $(this).removeClass(this.className.split(' ').pop());
    setTimeout(function () {
      $('.easytransitions_transition div').addClass(transition_type)
    }, 100)
  })
}