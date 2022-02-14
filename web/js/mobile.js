$(document).ready(function () {
    function detectMob() {
        const toMatch = [
            /Android/i,
            /webOS/i,
            /iPhone/i,
            /iPad/i,
            /iPod/i,
            /BlackBerry/i,
            /Windows Phone/i
        ]
        return toMatch.some((toMatchItem) => {
            return navigator.userAgent.match(toMatchItem);
        })
    }
    if (detectMob()) {
        // then disable stuffs 
        $('#lines-animation').animate({ opacity: 0 }, 100)
    }
})