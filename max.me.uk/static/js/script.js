// $(document).ready(function () {
// 	$(".post").click(function () {
// 		var page = $(this).attr("page");
// 		$.get(page, function (data) {
// 			$("#post").html(data);
// 		});
// 	});
// });

// var a = document.querySelector('.blur-image');
// document.addEventListener("DOMContentLoaded", function() {
// 	if (!a) return !1;
// 	var b = a.getAttribute("data-src"),
// 		c = document.querySelector(''),
// 		img = new Image;
//
// 	img.src = b;
// 	img.onload = function () {
// 		$(c).css("opacity", "0");
// 		$(c).css('background-image', 'url(' + b + ')');
// 		$(c).animate({opacity: 1}, 2000);
// 	};
// });

$(document).ready(function(){

	setTimeout(function(){
		if($(".content").css("padding-left") != "14px") {
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
});