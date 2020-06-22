$(document).ready(function () {
    $('.sidenav-trigger').click(function(){
        if (!$(this).attr("open") || $(this).attr("open").length > 1) {
            $(this).attr("open", "1");
            $(".sidebar").css("-webkit-transform", "translateX(0%)");
            $(".sidebar").css("transform", "translateX(0%)");
        }else{
            $(this).attr("open", "");
            $(".sidebar").css("-webkit-transform", "translateX(-105%)");
            $(".sidebar").css("transform", "translateX(-105%)");
        }
    });

    $(document).on('click', function(e) {
        if (e.target.id === "post") {
            $(".sidebar").css("-webkit-transform", "translateX(-105%)");
            $(".sidebar").css("transform", "translateX(-105%)");
        }
    });

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
});