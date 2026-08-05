var CV_URL = '/cv/max-mitchell-cv.pdf';

// Safari won't print a PDF loaded in an offscreen iframe, so it gets a tab instead.
var isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);

function printCV() {
    if (isSafari) {
        window.open(CV_URL, '_blank');
        return;
    }

    var existing = document.getElementById('cv-print-frame');
    if (existing) {
        existing.parentNode.removeChild(existing);
    }

    var frame = document.createElement('iframe');
    frame.id = 'cv-print-frame';
    frame.src = CV_URL;
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0;';
    frame.onload = function () {
        try {
            frame.contentWindow.focus();
            frame.contentWindow.print();
        } catch (err) {
            window.open(CV_URL, '_blank');
        }
    };
    document.body.appendChild(frame);
}

// ⌘P / Ctrl+P prints the CV rather than the page
$(document).on('keydown', function (e) {
    var key = e.key || '';
    if (key.toLowerCase() === 'p' && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        printCV();
    }
});

$(document).ready(function () {
    if (window.location.href.endsWith('?nfc')) {
        window.history.pushState({}, document.title, window.location.pathname);

        const imageWrapper = document.querySelector('#nfc');
        imageWrapper.style.zIndex = 100;
        $('.nfc-image').css("display", "block");

        anime({
            targets: '#nfc',
            translateY: [-300, 0],
            easing: 'easeOutBack',
            duration: 1500,
            complete: function () {
                anime({
                    scale: {
                        value: 0,
                    },
                    delay: 300,
                    targets: '#nfc',
                    duration: 1500,
                    easing: 'easeInQuart',
                    complete: function () {
                        imageWrapper.remove();
                    }
                });
            }
        });
    } else if (!$.cookie('should-animate')) {
        //set expiry to current time plus 1 minutes in milliseconds
        var expire = new Date();
        expire.setTime(expire.getTime() + (1 * 60 * 1000));
        $.cookie('should-animate', true, {expires: expire});

        $(".info").scramble(5000, 1);
    }

    $('.sidenav-trigger').click(function (e) {
        $(this).attr("data-open", "1");
        $(".sidebar").css("-webkit-transform", "translateX(0%)");
        $(".sidebar").css("transform", "translateX(0%)");
        e.preventDefault();
        return false;
    });

    $('a').each(function () {
        var a = new RegExp('/' + window.location.host + '/');
        if (!a.test(this.href)) {
            $(this).attr("target", "_blank");
        }
    });

    $(document).on('click', function (e) {
        var dataOpen = $('.sidenav-trigger').attr("data-open");
        if (dataOpen && dataOpen.length > 0) {
            if (!$(e.target).hasClass("sidebar") && $(e.target).parents('.sidebar').length === 0) {
                $('.sidenav-trigger').attr("data-open", "");
                $(".sidebar").css("-webkit-transform", "translateX(-105%)");
                $(".sidebar").css("transform", "translateX(-105%)");
            }
        }
    });

});