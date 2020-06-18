$(document).ready(function () {
    $('.sidenav').sidenav();

    // only load high quality image if root
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
    $("h1, h2, h3, h4, h5").click(function () {
        window.location.href = location.protocol + '//' + location.host + location.pathname + "#" + $(this).attr("id")
    })
});