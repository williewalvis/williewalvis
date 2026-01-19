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
    button: $('.transition_button_trigger_offers'),
    slide: $('#offers_section_transition'),
    page: "Offers"
  },
  {
    button: $('.transition_button_trigger_work'),
    slide: $('#work_section_transition'),
    page: "Partners"
  },
  {
    button: $('.transition_button_trigger_contact'),
    slide: $('#contact_section_transition'),
    page: "The Team"
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

          $('.active_slide').hide().removeClass('active_slide');
          active_slide.addClass('active_slide').show();

          // reset scroll when opening The Team (mobile scroll container)
          if (active_slide.attr('id') === 'contact_section_transition') {
            const scroller = document.querySelector('#contact_section_transition .contact-flexbox');
            if (scroller) scroller.scrollTop = 0;
          }

        }, change_point);

        // set timeout to reset debounce value
        setTimeout(() => {
          on = 1;
        }, slide_time)

        // set timeout to resolve promise for document reset
        setTimeout(() => { resolve() }, 500)

      }

    })

    // check for promise finish
    promise.then(() => { $('#menu-icon').prop('checked', false); })

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
          opacityShowing = true
          $("#player_card").animate({ opacity: 1 }, 500)
        }

      } else {

        if (opacityShowing) {
          opacityShowing = false
          $("#player_card").animate({ opacity: 0 }, 500)
        }

      }

    } catch (err) {

      if (opacityShowing) {
        opacityShowing = false
        $("#player_card").animate({ opacity: 0 }, 500)
      }
      return
    }

  }

  ws.onerror = () => {
    if (opacityShowing) {
      opacityShowing = false
      $("#player_card").animate({ opacity: 0 }, 500)
    }
  }

  ws.onclose = () => {
    if (opacityShowing) {
      opacityShowing = false
      $("#player_card").animate({ opacity: 0 }, 500)
    }
  }

}


// code for splashscreen
(function () {
  const splash = document.getElementById("splash");
  const textEl = document.getElementById("splashText");
  if (!splash || !textEl) return;

  if (sessionStorage.getItem("malco_splash_seen")) {
    splash.remove();
    return;
  }
  sessionStorage.setItem("malco_splash_seen", "1");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  gsap.set(".splash-inner", { opacity: 0, y: 12, filter: "blur(10px)" });
  gsap.to(".splash-inner", {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    duration: 0.7,
    ease: "power3.out",
    delay: 0.1,
  });

  function exitSplash() {
    splash.style.pointerEvents = "none";

    const tl = gsap.timeline({
      onComplete: () => splash.remove(),
    });

    tl.to(".splash-inner", {
      y: -10,
      opacity: 0,
      duration: 0.55,
      ease: "power3.inOut",
    }).to(
      "#splash",
      {
        opacity: 0,
        duration: 0.55,
        ease: "power2.out",
      },
      "<"
    );
  }

  window.addEventListener("load", () => {
    if (prefersReduced) {
      textEl.textContent = "Malherbes Co";
      setTimeout(exitSplash, 450);
      return;
    }

    new TypeIt("#splashText", {
      speed: 60,
      deleteSpeed: 34,
      lifeLike: true,
      startDelay: 150,
      cursor: true,
      cursorChar: "|",
      waitUntilVisible: true,
    })
      .type("Malherbes Co")
      .pause(600)
      .delete(null, { delay: 80 })
      .pause(140)
      .type('<span class="splash-em">IT</span>', { html: true })
      .pause(520)
      .type('<span class="splash-soft">, done properly</span>', { html: true })
      .pause(1100)
      .exec(exitSplash)
      .go();
  });
})();


// OFFERS: cursor pulse + click ripple (keep)
(function () {
  const cards = document.querySelectorAll(".offer-card");
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--mx", `50%`);
      card.style.setProperty("--my", `50%`);
    });

    card.addEventListener("click", (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;

      card.style.setProperty("--cx", `${x}px`);
      card.style.setProperty("--cy", `${y}px`);

      card.classList.remove("is-clicked");
      void card.offsetWidth;
      card.classList.add("is-clicked");
      setTimeout(() => card.classList.remove("is-clicked"), 600);
    });
  });
})();

// OFFERS: EXPAND (CENTER MODAL + ANIMATE CARD INTO SLOT) — UPDATED
(function () {
  const flexbox  = document.getElementById("offersFlexbox");
  const stage    = document.getElementById("offersStage");
  const detail   = document.getElementById("offersDetail");
  const closeBtn = document.getElementById("offersCloseBtn");
  const slot     = document.getElementById("offersSelectedSlot");

  const titleEl   = document.getElementById("offersDescTitle");
  const descEl    = document.getElementById("offersDescText");
  const plansGrid = document.getElementById("offersPlansGrid");

  const cards = document.querySelectorAll(".offer-card");
  if (!flexbox || !stage || !detail || !closeBtn || !slot || !plansGrid || !titleEl || !descEl || !cards.length) return;

  // --- FIX: move modal to BODY on open (so fixed backdrop works even inside transformed parents)
  let originalDetailParent = null;
  let originalDetailNext   = null;

  function ensureDetailInBody() {
    if (detail.parentElement === document.body) return;
    originalDetailParent = detail.parentElement;
    originalDetailNext   = detail.nextElementSibling;
    document.body.appendChild(detail);
  }

  function restoreDetailParent() {
    if (!originalDetailParent) return;

    if (originalDetailNext && originalDetailNext.parentElement === originalDetailParent) {
      originalDetailParent.insertBefore(detail, originalDetailNext);
    } else {
      originalDetailParent.appendChild(detail);
    }

    originalDetailParent = null;
    originalDetailNext = null;
  }

  const offersData = {
    churches: {
      title: "Churches",
      desc: "Reliable WiFi, secure networks, backups, and ongoing IT support — built around volunteer-friendly operations and predictable service costs.",
      plans: [
        { name: "Tier 1", badge: "OPTION", price: "R7 000 – R14 000", includes: ["Core setup & stabilisation", "Baseline security hardening", "Backup + recovery basics"] },
        { name: "Tier 2", badge: "BEST FIT", price: "R14 000 – R25 000", includes: ["Managed monitoring & response", "Improved WiFi coverage / tuning", "User support + documentation"], recommended: true },
        { name: "Tier 3", badge: "OPTION", price: "R25 000 – R45 000", includes: ["Advanced security layers", "Uptime-first design + redundancy", "Priority response + reviews"] },
        { name: "Build Your Own", badge: "OPTION", price: "Custom", includes: ["Choose exactly what you need", "Scale per site / branch", "We quote based on scope"] }
      ]
    },

    // --- UPDATED: Schools uses includes/excludes/addons/bestFor
    schools: {
      title: "Schools",
      desc: "Structured IT management for schools — from essential staff support to fully governed, device-controlled, audit-ready environments.",
      plans: [
        {
          name: "Tier 1",
          badge: "ESSENTIAL",
          price: "R7,500 – R10,000 / month",
          includes: [
            "Remote helpdesk support for staff",
            "Website hosting",
            "On-site support (scheduled)",
            "Monitoring of servers & core network equipment",
            "Internet & Wi-Fi uptime monitoring",
            "Basic cybersecurity protection",
            "Data backups (critical systems) – via Veeam Data Cloud",
            "User account management (staff)",
            "Incident logging & resolution tracking",
            "Vendor & license management (Microsoft, Google, etc.)"
          ],
          excludes: [
            "Advanced security, learner devices, compliance reporting, or automation systems"
          ]
        },
        {
          name: "Tier 2",
          badge: "RECOMMENDED",
          price: "R12,000 – R18,000 / month",
          recommended: true,
          includes: [
            "Everything in Tier 1",
            "Full IT environment management",
            "Advanced firewall & content filtering",
            "Learner & staff network separation",
            "Email security & anti-phishing – Mimecast",
            "Backup monitoring & disaster recovery testing",
            "Device setup & lifecycle management",
            "IT audits & improvement recommendations",
            "Priority response times",
            "Monthly health & security reporting"
          ],
          addons: [
            "After-hours support",
            "CCTV monitoring (outsourced or AI)",
            "Biometrics system support"
          ]
        },
        {
          name: "Tier 3",
          badge: "ENTERPRISE",
          price: "R20,000 – R30,000 / month",
          includes: [
            "Everything in Tier 2",
            "Mobile Device Management (MDM) for learner & staff devices",
            "Exam environment lockdown & device policies",
            "Bring-your-own-device (BYOD) device control",
            "Advanced cybersecurity monitoring",
            "Staff & learner access control system support",
            "Integration support (biometrics, CCTV, boom gates)",
            "Compliance & audit-ready reporting",
            "Incident response planning",
            "Dedicated account manager",
            "Quarterly strategy & planning sessions"
          ],
          bestFor: [
            "BYOD schools",
            "Boarding schools"
          ]
        },
        {
          name: "Build Your Own",
          badge: "CUSTOM",
          price: "Contact Our Team",
          includes: ["Budget friendly", "Select what matters", "Scalable to needs", "Quoted per scope"]
        }
      ]
    },

    retail: {
      title: "Retail",
      desc: "POS-first uptime, stable WiFi, monitoring and CCTV readiness — so you stay online, trading, and protected.",
      plans: [
        { name: "Tier 1", badge: "OPTION", price: "R7 000 – R14 000", includes: ["Core network stability", "Basic security hardening", "Backup fundamentals"] },
        { name: "Tier 2", badge: "BEST FIT", price: "R14 000 – R25 000", includes: ["Monitoring + response", "WiFi coverage tuning", "Support + documentation"], recommended: true },
        { name: "Tier 3", badge: "OPTION", price: "R25 000 – R45 000", includes: ["Advanced security layers", "Redundancy planning", "Priority response + reviews"] },
        { name: "Build Your Own", badge: "OPTION", price: "Custom", includes: ["Select what matters", "Scale per store", "Quoted per scope"] }
      ]
    },

    hospitality: {
      title: "Hospitality",
      desc: "Guest WiFi done properly — AP tuning, coverage planning, monitoring and support to keep guests connected.",
      plans: [
        { name: "Tier 1", badge: "OPTION", price: "R7 000 – R14 000", includes: ["Core setup + stabilisation", "Basic guest WiFi config", "Backup essentials"] },
        { name: "Tier 2", badge: "BEST FIT", price: "R14 000 – R25 000", includes: ["AP tuning + coverage optimisation", "Monitoring + response", "Support + documentation"], recommended: true },
        { name: "Tier 3", badge: "OPTION", price: "R25 000 – R45 000", includes: ["Security layers + segmentation", "Uptime + redundancy focus", "Priority support + reviews"] },
        { name: "Build Your Own", badge: "OPTION", price: "Custom", includes: ["Pick the exact setup", "Scale per property", "Quoted per scope"] }
      ]
    },

    medical: {
      title: "Medical",
      desc: "Secure systems, backups and privacy-first operations — built for reliability, access control and sensible compliance.",
      plans: [
        { name: "Tier 1", badge: "OPTION", price: "R7 000 – R14 000", includes: ["Core stabilisation", "Baseline security", "Backup basics"] },
        { name: "Tier 2", badge: "BEST FIT", price: "R14 000 – R25 000", includes: ["Monitoring + response", "Improved network segmentation", "Support + documentation"], recommended: true },
        { name: "Tier 3", badge: "OPTION", price: "R25 000 – R45 000", includes: ["Advanced security layers", "Uptime-first design", "Priority support + reviews"] },
        { name: "Build Your Own", badge: "OPTION", price: "Custom", includes: ["Choose your stack", "Scale per practice", "Quoted per scope"] }
      ]
    },

    professional: {
      title: "Professional",
      desc: "Email, devices, security and managed support — a clean and reliable setup for teams that need stuff to just work.",
      plans: [
        { name: "Tier 1", badge: "OPTION", price: "R7 000 – R14 000", includes: ["Core setup + baseline", "Basic endpoint hardening", "Backup essentials"] },
        { name: "Tier 2", badge: "BEST FIT", price: "R14 000 – R25 000", includes: ["Monitoring + response", "Better WiFi + network tuning", "User + device support"], recommended: true },
        { name: "Tier 3", badge: "OPTION", price: "R25 000 – R45 000", includes: ["Advanced security layers", "Redundancy + uptime focus", "Priority support + reviews"] },
        { name: "Build Your Own", badge: "OPTION", price: "Custom", includes: ["Pick what you need", "Scale by team size", "Quoted per scope"] }
      ]
    }
  };

  let animating = false;
  let activeKey = null;

  function buildPlans(plans) {
    plansGrid.innerHTML = "";

    const sectionList = (title, items) => {
      if (!items || !items.length) return "";
      return `
        <div class="plan-section">
          <div class="plan-section-title">${title}</div>
          <ul class="plan-features">
            ${items.map(i => `<li>${i}</li>`).join("")}
          </ul>
        </div>
      `;
    };

    plans.forEach(p => {
      const el = document.createElement("div");
      el.className = "plan-card";

      el.innerHTML = `
        <div class="plan-top">
          <div class="plan-title">${p.name}</div>
          <div class="plan-badge">${p.recommended ? "RECOMMENDED" : (p.badge || "OPTION")}</div>
        </div>

        <div class="plan-price">${p.price || ""}</div>

        ${sectionList("Includes", p.includes)}
        ${sectionList("Does not include", p.excludes)}
        ${sectionList("Optional add-ons", p.addons)}
        ${sectionList("Best suited for", p.bestFor)}
      `;

      plansGrid.appendChild(el);
    });
  }

  function openOffer(card) {
    if (animating) return;

    const key = card.getAttribute("data-offer");
    const data = offersData[key];
    if (!data) return;

    animating = true;
    activeKey = key;

    stage.classList.add("is-dimmed");

    titleEl.textContent = data.title;
    descEl.textContent = data.desc;
    buildPlans(data.plans);

    slot.innerHTML = "";

    // Show modal (FIXED for scaled-down/transform issues)
    ensureDetailInBody();
    detail.classList.add("is-open");
    detail.setAttribute("aria-hidden", "false");
    gsap.killTweensOf(detail);
    gsap.set(detail, { opacity: 1 });

    // reset panel scroll to top
    const panel = detail.querySelector(".offers-detail-panel");
    if (panel) panel.scrollTop = 0;

    const from = card.getBoundingClientRect();

    slot.style.width = `${from.width}px`;
    slot.style.height = `${from.height}px`;

    const flying = card.cloneNode(true);
    flying.classList.add("offer-card--flying");
    flying.style.position = "fixed";
    flying.style.left = `${from.left}px`;
    flying.style.top = `${from.top}px`;
    flying.style.width = `${from.width}px`;
    flying.style.height = `${from.height}px`;
    flying.style.margin = "0";
    flying.style.zIndex = "99999";
    flying.style.pointerEvents = "none";
    flying.style.transform = "none";
    document.body.appendChild(flying);

    requestAnimationFrame(() => {
      const to = slot.getBoundingClientRect();

      gsap.to(flying, {
        left: to.left,
        top: to.top,
        width: to.width,
        height: to.height,
        duration: 0.65,
        ease: "power3.inOut",
        onComplete: () => {
          const settled = card.cloneNode(true);
          settled.classList.add("offer-card--static");
          settled.style.transform = "none";
          settled.classList.remove("is-clicked");
          slot.appendChild(settled);

          document.body.removeChild(flying);
          animating = false;
        }
      });
    });
  }

  function closeOffer() {
    if (animating) return;

    gsap.to(detail, {
      opacity: 0,
      duration: 0.18,
      ease: "power2.in",
      onComplete: () => {
        detail.classList.remove("is-open");
        detail.setAttribute("aria-hidden", "true");

        slot.innerHTML = "";
        slot.style.width = "";
        slot.style.height = "";

        stage.classList.remove("is-dimmed");

        detail.style.opacity = "";
        activeKey = null;

        // Restore modal to original DOM location
        restoreDetailParent();
      }
    });
  }

  cards.forEach(card => {
    card.addEventListener("click", () => {
      try {
        openOffer(card);
      } catch (e) {
        console.error(e);
        stage.classList.remove("is-dimmed");
        animating = false;
      }
    });
  });

  closeBtn.addEventListener("click", closeOffer);

  detail.addEventListener("click", (e) => {
    if (e.target === detail) closeOffer();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && detail.classList.contains("is-open")) closeOffer();
  });
})();
