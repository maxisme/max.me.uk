$(document).ready(function () {
    $('.sidenav-trigger').click(function (e) {
        $(this).attr("data-open", "1");
        $(".sidebar").css("-webkit-transform", "translateX(0%)");
        $(".sidebar").css("transform", "translateX(0%)");
        e.preventDefault();
        return false;
    });

    $('a').each(function() {
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

    // only load high quality background image if root
    if (location.pathname === "/") {
        setTimeout(function () {
            if ($(".sidebar").css("padding-left") != "14px") {
                // not small screen
                var img = new Image();
                var el = $("#newim");
                img.src = "/images/bg.jpg";
                img.onload = function () {
                    el.css("opacity", "0");
                    el.css('background-image', 'url(' + img.src + ')');
                    el.animate({opacity: 1}, 2000);
                };
            }
        }, 500);
    }
});