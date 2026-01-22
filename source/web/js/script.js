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
  const flexbox = document.getElementById("offersFlexbox");
  const stage = document.getElementById("offersStage");
  const detail = document.getElementById("offersDetail");
  const closeBtn = document.getElementById("offersCloseBtn");
  const slot = document.getElementById("offersSelectedSlot");

  const titleEl = document.getElementById("offersDescTitle");
  const descEl = document.getElementById("offersDescText");
  const plansGrid = document.getElementById("offersPlansGrid");

  const cards = document.querySelectorAll(".offer-card");
  if (!flexbox || !stage || !detail || !closeBtn || !slot || !plansGrid || !titleEl || !descEl || !cards.length) return;

  // --- FIX: move modal to BODY on open (so fixed backdrop works even inside transformed parents)
  let originalDetailParent = null;
  let originalDetailNext = null;

  function ensureDetailInBody() {
    if (detail.parentElement === document.body) return;
    originalDetailParent = detail.parentElement;
    originalDetailNext = detail.nextElementSibling;
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
      desc: "Reliable technology for worship, operations, and media — from weekday admin support to full campus IT + production management.",
      plans: [
        {
          name: "Build Your Own",
          badge: "CUSTOM",
          price: "Contact Our Team",
          includes: [
            "Budget friendly",
            "Select what matters most",
            "Scalable to your environment",
            "Quoted per scope"
          ]
        },
        {
          name: "Tier 1",
          badge: "CORE",
          price: "R6,000 – R8,000 / month",
          includes: [
            "Remote IT helpdesk support (office staff)",
            "Support for admin PCs & printers",
            "Email setup & account management",
            "Internet & Wi-Fi monitoring",
            "Basic firewall & antivirus checks",
            "Data backups (admin systems only)",
            "User access management",
            "Incident logging"
          ],
          excludes: [
            "Media & AV systems",
            "Livestream support",
            "CCTV & access control",
            "Weekend / event support",
            "Compliance reporting"
          ],
          bestFor: ["Small churches", "Minimal weekday operations"],
          addons: [
            "CCTV monitoring",
            "After-hours / Sunday standby",
            "Website hosting & updates",
            "Livestream optimisation & QA"
          ]
        },
        {
          name: "Tier 2",
          badge: "MANAGED",
          price: "R12,000 – R16,000 / month",
          recommended: true,
          includes: [
            "Everything in Tier 1",
            "Full IT environment management",
            "Advanced firewall & network security",
            "Staff vs guest Wi-Fi separation",
            "Email security & spam protection",
            "Backup monitoring & restore testing",
            "AV system support (screens, projectors, sound PCs)",
            "Livestream system support (YouTube / Facebook)",
            "Vendor & license management",
            "Priority response times",
            "Monthly system health reporting"
          ],
          excludes: [
            "Dedicated Sunday support",
            "CCTV monitoring",
            "Compliance & governance reporting",
            "Advanced security response"
          ],
          bestFor: ["Medium churches", "Regular events", "Livestreaming setups"],
          addons: [
            "CCTV monitoring",
            "After-hours / Sunday standby",
            "Website hosting & updates",
            "Livestream optimisation & QA"
          ]
        },
        {
          name: "Tier 3",
          badge: "FULL CAMPUS",
          price: "R25,000 / month",
          includes: [
            "Everything in Tier 2",

            "Unlimited remote & on-site support",
            "Network, Wi-Fi & firewall management",
            "Staff & leadership device management",
            "Backup, disaster recovery & continuity planning",
            "Advanced cybersecurity monitoring",

            "Livestream PC, encoder & network support",
            "Projection & screen systems support",
            "Media booth & control room systems",
            "Sunday service & event priority support",
            "Volunteer tech onboarding & support",

            "CCTV system management & support",
            "Access control & alarm system integration",
            "Footage retention & incident support",

            "Compliance & audit reporting",
            "Incident documentation",
            "Technology roadmap & planning",
            "Vendor consolidation & management",

            "Weekend & after-hours support",
            "Priority SLA response",
            "Dedicated account manager",
            "Quarterly strategy & review meetings"
          ],
          bestFor: ["Large churches", "Media-heavy environments", "Multi-service campuses"],
          addons: [
            "CCTV monitoring",
            "After-hours / Sunday standby",
            "Website hosting & updates",
            "Livestream optimisation & QA"
          ]
        }
      ]
    },

    schools: {
      title: "Schools",
      desc: "Structured IT management for schools — from essential staff support to fully governed, device-controlled, audit-ready environments.",
      plans: [
        {
          name: "Build Your Own",
          badge: "CUSTOM",
          price: "Contact Our Team",
          includes: ["Budget friendly", "Select what matters", "Scalable to needs", "Quoted per scope"]
        },
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
          ],
          bestFor: ["Smaller schools", "Core staff support + stability"]
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
          ],
          bestFor: ["Growing schools", "More devices + stronger governance"]
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
          bestFor: ["BYOD schools", "Boarding schools", "High-compliance environments"]
        }
      ]
    },

    retail: {
      title: "Retail",
      desc: "POS-first uptime, stable WiFi, monitoring and security support — built to keep you trading, online, and protected.",
      plans: [
        {
          name: "Build Your Own",
          badge: "CUSTOM",
          price: "Contact Our Team",
          includes: [
            "Per-store or multi-store scope",
            "Choose exactly what you need",
            "Scalable to franchises",
            "Quoted per site"
          ]
        },
        {
          name: "Tier 1",
          badge: "CORE",
          price: "R4,500 – R7,000 / store / month",
          includes: [
            "Remote IT helpdesk support",
            "POS system support (software & workstation level)",
            "Internet & network monitoring",
            "Office PC & back-office device support",
            "Email & user account management",
            "Basic cybersecurity (antivirus & firewall checks)",
            "Data backups (POS & admin data)",
            "Incident logging & resolution tracking"
          ],
          excludes: [
            "CCTV monitoring",
            "After-hours support",
            "Compliance reporting",
            "Multi-branch management"
          ],
          bestFor: ["Small independent stores", "Low-tech retail"]
        },
        {
          name: "Tier 2",
          badge: "MANAGED",
          price: "R8,000 – R14,000 / store / month",
          recommended: true,
          includes: [
            "Everything in Tier 1",
            "Full network & Wi-Fi management",
            "Advanced firewall & content filtering",
            "Secure separation of POS, staff, and guest Wi-Fi",
            "POS uptime monitoring & rapid response",
            "Vendor & license management",
            "Backup monitoring & restore testing",
            "CCTV system support (hardware & software)",
            "Priority response times",
            "Monthly system health reporting"
          ],
          bestFor: ["Busy stores", "Franchise outlets", "Grocery / clothing / hardware"]
        },
        {
          name: "Tier 3",
          badge: "ENTERPRISE",
          price: "R18,000 – R30,000+ / store / month",
          includes: [
            "Everything in Tier 2",

            "Unlimited remote & on-site support",
            "Advanced cybersecurity monitoring",
            "Network redundancy & failover planning",
            "Store opening/closing system support",
            "Centralised multi-store management",

            "Advanced POS security",
            "Payment environment hardening",
            "Incident response for transaction failures",
            "Integration support (inventory, ERP, head office)",

            "CCTV monitoring & footage management",
            "Access control (staff-only areas)",
            "Alarm system integration",
            "Incident & theft investigation support",

            "PCI-DSS aligned security checks (high-level)",
            "Compliance & audit reporting",
            "Risk & incident documentation",
            "IT standardisation across stores",

            "After-hours & weekend support",
            "Priority SLA response",
            "Dedicated account manager",
            "Quarterly technology planning sessions"
          ],
          bestFor: ["High-volume retail", "Multi-branch", "High-risk environments"]
        }
      ]
    },

    hospitality: {
      title: "Hospitality",
      desc: "Guest WiFi done properly — coverage planning, AP tuning, monitoring, and support to keep guests connected and operations stable.",
      plans: [
        {
          name: "Build Your Own",
          badge: "CUSTOM",
          price: "Contact Our Team",
          includes: [
            "Guest WiFi-focused scopes",
            "Per-venue or multi-venue",
            "Quoted per layout & capacity needs",
            "Hardware refresh planning"
          ]
        },
        {
          name: "Tier 1",
          badge: "ESSENTIAL",
          price: "R6,000 – R9,000 / month",
          includes: [
            "Guest Wi-Fi setup & management",
            "Access Point (AP) tuning for coverage & stability",
            "Secure guest vs staff network separation",
            "Internet uptime monitoring",
            "Basic captive portal (terms & branding)",
            "Remote support for guest connectivity issues",
            "Monthly Wi-Fi performance checks"
          ],
          bestFor: ["Small hotels", "Guesthouses", "Restaurants", "Lodges"],
          addons: [
            "Secondary internet failover",
            "Guest Wi-Fi analytics & reporting",
            "CCTV monitoring",
            "After-hours support",
            "Branded captive portal upgrades",
            "Once-off: Wi-Fi site surveys",
            "Once-off: AP installation & cabling",
            "Once-off: Network rack upgrades",
            "Once-off: Firewall replacements",
            "Once-off: Guest Wi-Fi hardware refreshes"
          ]
        },
        {
          name: "Tier 2",
          badge: "MANAGED",
          price: "R10,000 – R16,000 / month",
          recommended: true,
          includes: [
            "Everything in Tier 1",

            "Coverage planning (room-by-room / seating-area planning)",
            "Advanced AP tuning (band steering, roaming, load balancing)",
            "Performance monitoring & optimisation",
            "Guest experience troubleshooting",
            "Branded captive portal with usage rules",

            "Full network & firewall management",
            "Staff device & POS network separation",
            "Internet redundancy planning",
            "Priority support response times",
            "Monthly network health reporting"
          ],
          bestFor: ["Busy hotels", "Resorts", "High-footfall venues"],
          addons: [
            "Secondary internet failover",
            "Guest Wi-Fi analytics & reporting",
            "CCTV monitoring",
            "After-hours support",
            "Branded captive portal upgrades",
            "Once-off: Wi-Fi site surveys",
            "Once-off: AP installation & cabling",
            "Once-off: Network rack upgrades",
            "Once-off: Firewall replacements",
            "Once-off: Guest Wi-Fi hardware refreshes"
          ]
        },
        {
          name: "Tier 3",
          badge: "PREMIUM",
          price: "R18,000 – R28,000+ / month",
          includes: [
            "Everything in Tier 2",

            "Wi-Fi design & capacity planning",
            "Peak-time performance optimisation",
            "Real-time monitoring & alerts",
            "Guest issue escalation handling",
            "SLA-backed Wi-Fi uptime targets",

            "Advanced cybersecurity monitoring",
            "POS & payment network protection",
            "CCTV & access system support",
            "Multi-site centralised management",
            "Compliance & audit reporting",

            "After-hours & weekend support",
            "Dedicated account manager",
            "Quarterly performance & improvement reviews"
          ],
          bestFor: ["Large hotels", "Hospitality groups", "Multi-venue properties"],
          addons: [
            "Secondary internet failover",
            "Guest Wi-Fi analytics & reporting",
            "CCTV monitoring",
            "After-hours support",
            "Branded captive portal upgrades",
            "Once-off: Wi-Fi site surveys",
            "Once-off: AP installation & cabling",
            "Once-off: Network rack upgrades",
            "Once-off: Firewall replacements",
            "Once-off: Guest Wi-Fi hardware refreshes"
          ]
        }
      ]
    },

    medical: {
      title: "Medical",
      desc: "Secure, reliable systems for practices handling sensitive data — backups, access control, and audit-ready IT support (IT scope only).",
      plans: [
        {
          name: "Build Your Own",
          badge: "CUSTOM",
          price: "Contact Our Team",
          includes: [
            "Privacy-first scopes",
            "Select systems & support areas",
            "Quoted per practice size and risk profile",
            "Clear IT-only compliance support"
          ]
        },
        {
          name: "Tier 1",
          badge: "ESSENTIAL",
          price: "R6,000 – R9,000 / month",
          includes: [
            "Remote IT helpdesk support",
            "Support for reception & admin PCs",
            "Practice management software support (system-level)",
            "Secure network & Wi-Fi setup",
            "Antivirus & firewall management",
            "Daily automated backups (onsite or cloud)",
            "User account & access management",
            "Incident logging & resolution tracking"
          ],
          excludes: ["Advanced security monitoring", "Compliance reporting", "After-hours support"],
          bestFor: ["Small practices", "Low staff count + sensitive data"],
          addons: [
            "Compliance & audit reporting (IT scope only)",
            "After-hours / emergency support",
            "Secure remote doctor access",
            "Backup & DR testing",
            "CCTV & access system support",
            "Once-off: Secure network redesigns",
            "Once-off: Server replacements & upgrades",
            "Once-off: Backup system installations",
            "Once-off: Access control & biometric systems",
            "Once-off: Compliance remediation projects (IT scope)"
          ]
        },
        {
          name: "Tier 2",
          badge: "MANAGED",
          price: "R12,000 – R18,000 / month",
          recommended: true,
          includes: [
            "Everything in Tier 1",

            "Advanced firewall & intrusion protection",
            "Role-based access control (doctor vs admin)",
            "Secure remote access for doctors",
            "Email security & phishing protection",

            "Backup monitoring & restore testing",
            "Disaster recovery readiness checks",
            "System uptime monitoring",

            "Vendor & license management",
            "Priority support response times",
            "Monthly system health reporting"
          ],
          bestFor: ["Busy practices", "Multi-doctor clinics", "Shared facilities"],
          addons: [
            "Compliance & audit reporting (IT scope only)",
            "After-hours / emergency support",
            "Secure remote doctor access",
            "Backup & DR testing",
            "CCTV & access system support",
            "Once-off: Secure network redesigns",
            "Once-off: Server replacements & upgrades",
            "Once-off: Backup system installations",
            "Once-off: Access control & biometric systems",
            "Once-off: Compliance remediation projects (IT scope)"
          ]
        },
        {
          name: "Tier 3",
          badge: "CLINICAL-GRADE",
          price: "R20,000 – R30,000+ / month",
          includes: [
            "Everything in Tier 2",

            "Advanced cybersecurity monitoring",
            "Encryption enforcement (data at rest & in transit)",
            "Secure access auditing & logging",
            "Staff onboarding/offboarding controls",

            "Multi-layer backup strategy",
            "Regular restore testing",
            "Business continuity & downtime planning",

            "POPIA-aligned data handling checks (IT scope)",
            "Access & activity audit trails",
            "Incident & breach documentation support",
            "Compliance & audit reporting (IT scope only)",

            "After-hours & emergency support",
            "Dedicated account manager",
            "Quarterly risk & improvement reviews"
          ],
          bestFor: ["Medical centres", "Day clinics", "Higher-risk environments"],
          addons: [
            "Compliance & audit reporting (IT scope only)",
            "After-hours / emergency support",
            "Secure remote doctor access",
            "Backup & DR testing",
            "CCTV & access system support",
            "Once-off: Secure network redesigns",
            "Once-off: Server replacements & upgrades",
            "Once-off: Backup system installations",
            "Once-off: Access control & biometric systems",
            "Once-off: Compliance remediation projects (IT scope)"
          ]
        }
      ]
    },

    professional: {
      title: "Professional",
      desc: "Email, devices, security and managed support — designed for teams that need everything to just work, consistently.",
      plans: [
        {
          name: "Build Your Own",
          badge: "CUSTOM",
          price: "Contact Our Team",
          includes: [
            "Pick the exact services you need",
            "Scale by team size",
            "Quoted per scope",
            "Ideal for hybrid requirements"
          ]
        },
        {
          name: "Tier 1",
          badge: "ESSENTIAL",
          price: "R4,500 – R7,000 / month",
          includes: [
            "Managed business email (setup & support)",
            "User account & mailbox management",
            "Support for laptops & desktops",
            "Remote IT helpdesk support",
            "Internet & Wi-Fi monitoring",
            "Basic cybersecurity (antivirus & firewall checks)",
            "Data backups (critical business data)",
            "Incident logging & tracking"
          ],
          excludes: [
            "Advanced security",
            "Device policies",
            "Compliance reporting",
            "After-hours support"
          ],
          bestFor: ["Small teams (2–10 users)", "Reliable basics"],
          addons: [
            "Compliance & audit reporting (IT scope only)",
            "After-hours / emergency support",
            "Secure remote work setup",
            "Advanced backup & DR testing",
            "Website hosting & maintenance",
            "Once-off: New office IT setups",
            "Once-off: Network cabling & Wi-Fi upgrades",
            "Once-off: Server replacements or cloud migrations",
            "Once-off: Security remediation projects",
            "Once-off: Device rollouts"
          ]
        },
        {
          name: "Tier 2",
          badge: "MANAGED",
          price: "R8,000 – R14,000 / month",
          recommended: true,
          includes: [
            "Everything in Tier 1",

            "Advanced email security & anti-phishing",
            "Shared mailboxes & permissions",
            "Cloud collaboration setup (Microsoft / Google)",

            "Device setup & lifecycle management",
            "Secure remote access",
            "Patch & update management",

            "Advanced firewall & endpoint protection",
            "Staff vs guest Wi-Fi separation",
            "Backup monitoring & restore testing",

            "Priority response times",
            "Vendor & license management",
            "Monthly system health reporting"
          ],
          bestFor: ["Growing teams (5–25 users)", "Daily IT reliance"],
          addons: [
            "Compliance & audit reporting (IT scope only)",
            "After-hours / emergency support",
            "Secure remote work setup",
            "Advanced backup & DR testing",
            "Website hosting & maintenance",
            "Once-off: New office IT setups",
            "Once-off: Network cabling & Wi-Fi upgrades",
            "Once-off: Server replacements or cloud migrations",
            "Once-off: Security remediation projects",
            "Once-off: Device rollouts"
          ]
        },
        {
          name: "Tier 3",
          badge: "BUSINESS-CRITICAL",
          price: "R18,000 – R25,000+ / month",
          includes: [
            "Everything in Tier 2",

            "Mobile Device Management (MDM)",
            "Secure device policies",
            "Staff onboarding & offboarding controls",

            "Advanced cybersecurity monitoring",
            "Secure access auditing & logs",
            "Ransomware & breach prevention measures",
            "Incident response planning",

            "Business continuity & downtime planning",
            "Multi-layer backup strategy",
            "Regular restore testing",

            "After-hours & emergency support",
            "Dedicated account manager",
            "Quarterly IT & security reviews"
          ],
          bestFor: ["Professional firms where downtime = lost revenue", "Security-first environments"],
          addons: [
            "Compliance & audit reporting (IT scope only)",
            "After-hours / emergency support",
            "Secure remote work setup",
            "Advanced backup & DR testing",
            "Website hosting & maintenance",
            "Once-off: New office IT setups",
            "Once-off: Network cabling & Wi-Fi upgrades",
            "Once-off: Server replacements or cloud migrations",
            "Once-off: Security remediation projects",
            "Once-off: Device rollouts"
          ]
        }
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

// QUOTE FORM MODAL (CTA + validation + submit animation + close all modals)
(function () {
  const openBtn = document.getElementById("openQuoteBtn");
  const modal = document.getElementById("quoteModal");
  const closeBtn = document.getElementById("quoteCloseBtn");
  const form = document.getElementById("quoteForm");
  const submitBtn = document.getElementById("quoteSubmitBtn");

  if (!openBtn || !modal || !closeBtn || !form || !submitBtn) return;

  // If you want to POST to an API later, set this:
  // const FORM_ENDPOINT = "https://api.yourdomain.co.za/quote";
  const FORM_ENDPOINT = null;

  // Move modal to body like Offers detail (prevents transform/stacking issues)
  let originalParent = null;
  let originalNext = null;

  function ensureInBody() {
    if (modal.parentElement === document.body) return;
    originalParent = modal.parentElement;
    originalNext = modal.nextElementSibling;
    document.body.appendChild(modal);
  }

  function restoreParent() {
    if (!originalParent) return;
    if (originalNext && originalNext.parentElement === originalParent) {
      originalParent.insertBefore(modal, originalNext);
    } else {
      originalParent.appendChild(modal);
    }
    originalParent = null;
    originalNext = null;
  }

  function closeOffersDetailIfOpen() {
    const offersDetail = document.getElementById("offersDetail");
    const offersClose = document.getElementById("offersCloseBtn");
    if (offersDetail && offersClose && offersDetail.classList.contains("is-open")) {
      offersClose.click();
    }
  }

  function closeQuoteModal() {
    gsap.to(modal, {
      opacity: 0,
      duration: 0.18,
      ease: "power2.in",
      onComplete: () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        modal.style.opacity = "";
        restoreParent();
      }
    });
  }

  function openQuoteModal() {
    // optional: if offers detail is open, close it first
    closeOffersDetailIfOpen();

    ensureInBody();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    gsap.killTweensOf(modal);
    gsap.set(modal, { opacity: 1 });

    // reset panel scroll
    const panel = modal.querySelector(".quote-modal__panel");
    if (panel) panel.scrollTop = 0;

    // focus first field
    const first = form.querySelector("#qFullName");
    if (first) first.focus();
  }

  // ---- validation helpers
  const qFullName = document.getElementById("qFullName");
  const qCategory = document.getElementById("qCategory");
  const qEmail = document.getElementById("qEmail");
  const qPhone = document.getElementById("qPhone");

  const fields = [
    { el: qFullName, name: "Full Name" },
    { el: qCategory, name: "Service Category" },
    { el: qEmail, name: "Email" },
    { el: qPhone, name: "Phone Number" },
  ];

  function setError(inputEl, message) {
    const wrap = inputEl.closest(".quote-field");
    const err = form.querySelector(`.quote-error[data-for="${inputEl.id}"]`);
    if (wrap) wrap.classList.add("is-invalid");
    if (err) err.textContent = message || "";
  }

  function clearError(inputEl) {
    const wrap = inputEl.closest(".quote-field");
    const err = form.querySelector(`.quote-error[data-for="${inputEl.id}"]`);
    if (wrap) wrap.classList.remove("is-invalid");
    if (err) err.textContent = "";
  }

  function digitsCount(s) {
    return (s.match(/\d/g) || []).length;
  }

  function validate() {
    let ok = true;

    fields.forEach(f => clearError(f.el));

    // Full name: required, min 2, basic allowed chars
    const nameVal = (qFullName.value || "").trim();
    if (!nameVal) { ok = false; setError(qFullName, "Please enter your full name."); }
    else if (nameVal.length < 2) { ok = false; setError(qFullName, "Name is too short."); }
    else if (!/^[a-zA-ZÀ-ž' -]+$/.test(nameVal)) { ok = false; setError(qFullName, "Use letters only (plus spaces / - / ')."); }

    // Category: required
    if (!qCategory.value) { ok = false; setError(qCategory, "Please select a service category."); }

    // Email: required + basic format
    const emailVal = (qEmail.value || "").trim();
    if (!emailVal) { ok = false; setError(qEmail, "Please enter your email address."); }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) { ok = false; setError(qEmail, "Please enter a valid email."); }

    // Phone: required + allow + () - spaces; 7–15 digits
    const phoneVal = (qPhone.value || "").trim();
    if (!phoneVal) { ok = false; setError(qPhone, "Please enter your phone number."); }
    else if (!/^[0-9+() \-]+$/.test(phoneVal)) { ok = false; setError(qPhone, "Use digits and + ( ) - only."); }
    else {
      const d = digitsCount(phoneVal);
      if (d < 7 || d > 15) { ok = false; setError(qPhone, "Phone number length looks incorrect."); }
    }

    // focus first invalid
    if (!ok) {
      const firstInvalid = form.querySelector(".quote-field.is-invalid .quote-input");
      if (firstInvalid) firstInvalid.focus();
    }

    return ok;
  }

  // live clear on input
  form.addEventListener("input", (e) => {
    const t = e.target;
    if (t && t.classList && t.classList.contains("quote-input")) {
      clearError(t);
    }
  });

  // ---- submit logic
  function setSubmitState(state, text) {
    submitBtn.setAttribute("data-state", state);
    const textEl = submitBtn.querySelector(".quote-submit__text");
    if (textEl && text) textEl.textContent = text;

    if (state === "sending") submitBtn.disabled = true;
    if (state === "idle") submitBtn.disabled = false;
    if (state === "success") submitBtn.disabled = true;
    if (state === "error") submitBtn.disabled = false;
  }

  async function sendPayload(payload) {
    // mock (until you wire your API)
    if (!FORM_ENDPOINT) {
      await new Promise(res => setTimeout(res, 1200));
      return { ok: true };
    }

    // real POST
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Server returned an error.");
    return res;
  }

  function closeAllModals() {
    closeOffersDetailIfOpen();
    closeQuoteModal();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      fullName: qFullName.value.trim(),
      category: qCategory.value,
      email: qEmail.value.trim(),
      phone: qPhone.value.trim(),
      source: "offers_quote_modal",
      submittedAt: new Date().toISOString()
    };

    setSubmitState("sending", "Sending...");

    try {
      await sendPayload(payload);

      setSubmitState("success", "Sent");

      // brief success beat, then close everything + reset
      setTimeout(() => {
        form.reset();
        fields.forEach(f => clearError(f.el));
        setSubmitState("idle", "Submit");
        closeAllModals();
      }, 700);

    } catch (err) {
      console.error(err);
      setSubmitState("error", "Try Again");
      // show a generic error under email field (or make a top banner if you prefer)
      setError(qEmail, "Could not submit right now. Please try again.");
    }
  });

  // open / close handlers
  openBtn.addEventListener("click", openQuoteModal);
  closeBtn.addEventListener("click", closeQuoteModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeQuoteModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeQuoteModal();
  });
})();

// QUOTE FORM: submit -> POST, debounce, success/error UX, auto-close + TOKEN (prevents stale callbacks)
(function () {
  const modal = document.getElementById("quoteModal");
  const closeBtn = document.getElementById("quoteCloseBtn");
  const openBtn = document.getElementById("openQuoteBtn");
  const form = document.getElementById("quoteForm");
  const submit = document.getElementById("quoteSubmitBtn");

  const fullName = document.getElementById("qFullName");
  const email = document.getElementById("qEmail");
  const phone = document.getElementById("qPhone");
  const category = document.getElementById("qCategory");

  if (!modal || !form || !submit || !fullName || !email || !phone || !category) return;

  // status line (created once)
  let statusEl = modal.querySelector(".quote-status");
  if (!statusEl) {
    statusEl = document.createElement("div");
    statusEl.className = "quote-status";
    form.appendChild(statusEl);
  }

  function setStatus(msg, kind) {
    statusEl.textContent = msg || "";
    statusEl.classList.toggle("is-error", kind === "error");
    statusEl.classList.toggle("is-success", kind === "success");
    statusEl.style.display = msg ? "block" : "none";
  }

  function setError(input, msg) {
    const holder = modal.querySelector(`.quote-error[data-for="${input.id}"]`);
    if (holder) holder.textContent = msg || "";
    input.classList.toggle("is-invalid", !!msg);
  }

  function clearErrors() {
    [fullName, email, phone, category].forEach(i => setError(i, ""));
    setStatus("", null);
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function isValidPhone(v) {
    const digits = (v || "").replace(/[^\d]/g, "");
    return digits.length >= 9;
  }

  function validate() {
    clearErrors();
    let ok = true;

    const n = fullName.value.trim();
    const m = email.value.trim();
    const p = phone.value.trim();
    const c = category.value.trim();

    if (n.length < 2) { setError(fullName, "Please enter your full name."); ok = false; }
    if (!isValidEmail(m)) { setError(email, "Please enter a valid email address."); ok = false; }
    if (!isValidPhone(p)) { setError(phone, "Please enter a valid phone number."); ok = false; }
    if (!c) { setError(category, "Please select a category."); ok = false; }

    return ok;
  }

  // -------------------------
  // TOKEN + DEBOUNCE STATE
  // -------------------------
  let inFlight = false;
  let closeTimer = null;

  // token invalidates old async responses/timeouts if modal is reopened/closed
  let requestToken = 0;

  function clearCloseTimer() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  // modal open/close helpers
  function openModal() {
    requestToken++;           // invalidate any old callbacks
    clearCloseTimer();

    clearErrors();
    form.reset();
    setStatus("", null);

    submit.disabled = false;
    submit.setAttribute("data-state", "idle");
    submit.querySelector(".quote-submit__text").textContent = "Submit";

    inFlight = false;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    requestToken++;           // invalidate any old callbacks
    clearCloseTimer();

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    clearErrors();
    form.reset();
    setStatus("", null);

    submit.disabled = false;
    submit.setAttribute("data-state", "idle");
    submit.querySelector(".quote-submit__text").textContent = "Submit";

    inFlight = false;
  }

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (inFlight) return;

    if (!validate()) return;

    clearCloseTimer();

    // token for THIS submit
    const myToken = ++requestToken;

    // lock UI
    inFlight = true;
    submit.disabled = true;
    submit.setAttribute("data-state", "loading");
    submit.querySelector(".quote-submit__text").textContent = "Submitting";
    setStatus("Sending request…", null);

    // Build URL with querystring (API expects these keys)
    const url = new URL("https://api.malherbes.co/v1/submitQuery");
    url.searchParams.set("name", fullName.value.trim());
    url.searchParams.set("mail", email.value.trim());
    url.searchParams.set("phone", phone.value.trim());
    url.searchParams.set("category", category.value.trim());

    try {
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Accept": "application/json" }
      });

      let json = null;
      try { json = await res.json(); } catch (_) { }

      // ignore stale responses
      if (myToken !== requestToken) return;

      const ok = (res.status === 200 && json && json.status === true);

      if (ok) {
        submit.setAttribute("data-state", "success");
        submit.querySelector(".quote-submit__text").textContent = "Query submitted";
        setStatus("Success — we’ve received your request.", "success");

        closeTimer = setTimeout(() => {
          if (myToken !== requestToken) return; // ignore stale timeout
          closeModal();

          // also close offers modal if open
          const offersDetail = document.getElementById("offersDetail");
          if (offersDetail && offersDetail.classList.contains("is-open")) {
            const offersClose = document.getElementById("offersCloseBtn");
            if (offersClose) offersClose.click();
            else offersDetail.classList.remove("is-open");
          }
        }, 3000);

      } else {
        // unlock, show error, then close after 3s
        submit.disabled = true; // keep disabled until close
        submit.setAttribute("data-state", "idle");
        submit.querySelector(".quote-submit__text").textContent = "Submit";
        setStatus("Something went wrong. Please try again.", "error");

        closeTimer = setTimeout(() => {
          if (myToken !== requestToken) return;
          closeModal();
        }, 3000);
      }

    } catch (err) {
      if (myToken !== requestToken) return;

      submit.disabled = true; // keep disabled until close
      submit.setAttribute("data-state", "idle");
      submit.querySelector(".quote-submit__text").textContent = "Submit";
      setStatus("Something went wrong. Please try again.", "error");

      closeTimer = setTimeout(() => {
        if (myToken !== requestToken) return;
        closeModal();
      }, 3000);
    } finally {
      // Only unlock if this submit is still current and modal still open.
      if (myToken === requestToken && modal.classList.contains("is-open")) {
        inFlight = false;
        // keep disabled during the 3s success/error display
      }
    }
  }

  form.addEventListener("submit", handleSubmit);
})();
