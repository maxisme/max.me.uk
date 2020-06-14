<svg id="s" height="75" width="500">
    <defs>
        <style type="text/css">
            @import url('https://fonts.googleapis.com/css?family=Inconsolata');
        </style>
        <mask id="m" x="0" y="0" width="100" height="100">
            <text x="0" y="70" font-size="6em" font-family="Inconsolata" fill="#333">MAXIMILIAN</text>
        </mask>
    </defs>
</svg>

<script async src="https://code.jquery.com/jquery-3.2.1.js" integrity="sha256-DZAnKJ/6XZ9si04Hgrsxu/8s717jcIzLy3oi35EouyE=" crossorigin="anonymous"></script>
<script async src="//cdn.jsdelivr.net/npm/vivus@latest/dist/vivus.min.js"></script>
<script>
    function ran(max){
    	return Math.floor(Math.random() * max) + 1;
    }
    function createRanLine(svg, colour="#333", width=1){
		var max_x = svg.attr("width");
		var max_y = svg.attr("height");
    	do {
			var x1 = ran(max_x);
			var y1 = ran(max_y);
			var x2 = ran(max_x);
			var y2 = ran(max_y);
			var a = x1 - x2;
			var b = y1 - y2;
		}while(Math.sqrt( a*a + b*b ) < 140);

		var newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
		newLine.setAttribute('id','line2');
		newLine.setAttribute('x1',x1);
		newLine.setAttribute('y1',y1);
		newLine.setAttribute('x2',x2);
		newLine.setAttribute('y2',y2);
		newLine.setAttribute('style','stroke:'+colour+';stroke-width:'+width);
		newLine.setAttribute('mask',"url(#m)");
		svg.append(newLine);

    }
    $(document).ready(function () {
    	var svg = $("svg");
    	var i = 0;
    	for(var x = 0; x <= 250; x++) {
			createRanLine(svg);
		}
		new Vivus('s', {duration: 400, type: 'oneByOne', animTimingFunction: Vivus.EASE_IN});
	});
</script>