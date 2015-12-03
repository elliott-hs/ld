function ggHasHtml5Css3D() {
	var h = "perspective",
	y = ["Webkit", "Moz", "O", "ms", "Ms"],
	k;
	k = 0;
	for (k = 0; k < y.length; k++)"undefined" !== typeof document.documentElement.style[y[k] + "Perspective"] && (h = y[k] + "Perspective");
	"undefined" !== typeof document.documentElement.style[h] ? "webkitPerspective" in document.documentElement.style ? (h = document.createElement("style"), y = document.createElement("div"), k = document.head || document.getElementsByTagName("head")[0], h.textContent = "@media (-webkit-transform-3d) {#ggswhtml5{height:5px}}", k.appendChild(h), y.id = "ggswhtml5", document.documentElement.appendChild(y), k = 5 === y.offsetHeight, h.parentNode.removeChild(h), y.parentNode.removeChild(y)) : k = m: k = r;
	return k
}

function ggHasWebGL() {
	var h;
	if (h = !!window.WebGLRenderingContext) try {
		var y = document.createElement("canvas");
		y.width = 100;
		y.height = 100;
		var k = y.getContext("webgl");
		k || (k = y.getContext("experimental-webgl"));
		h = k ? m: r
	} catch(l) {
		h = r
	}
	return h
}

function flashChecker() {
    var hasFlash = 0; //是否安装了flash
    var flashVersion = 0; //flash版本
    if (navigator.plugins && navigator.plugins.length > 0) {
        var swf = navigator.plugins["Shockwave Flash"];
        if (swf) {
            hasFlash = 1;
            flashVersion = swf.description.split(" ");
        }
    }
    return {
        f: hasFlash,
        v: flashVersion
    };
}
		 
		// check for CSS3 3D transformations and WebGL

		