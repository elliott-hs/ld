function showimages(index, srcs) {
	if (!srcs || !srcs.length) return;
	
	var exec = require('child_process').execFile;
	exec('../plugin/ForcentAlbum/ForcentAlbum.exe',[srcs.join(",")],{},function(err, stdout, stderr){});
}

function showMap(url, contentId) {
    var div = document.createElement("div");
	div.style.cssText = "position:absolute;left:0;top:0;z-index:1000;width:100%;height:100%;background-color:black;";
	
	var back = document.createElement("div");
	back.addEventListener("click", function(){
		document.body.removeChild(this.parentNode);
	}, false);
	back.style.cssText = "z-index:100;position:absolute;left:0;top:0;width:100px;height:100px;background:url(images/back_larrow.png) center center no-repeat;";
	div.appendChild(back);
	
	var ifr = document.createElement("iframe");
	ifr.style.cssText = "border:0;width:100%;height:100%;";
	div.appendChild(ifr);
	document.body.appendChild(div);
	
	var m = url.split("=");
    var lat = m[1].split("&")[0]; //31.00283
    var lon = m[2];
	
	var ifrdoc = ifr.contentWindow.document;
	var s = "<html><head><script src='js/libs/pc/map.js'></script><style>body{margin:0;}</style></head><div id='map' style='width:100%;height:100%;'></div></html><script>var map = new BMap.Map('map');map.centerAndZoom(new BMap.Point(" + lon + ", " + lat + "), 20);var marker1 = new BMap.Marker(new BMap.Point(" + lon + ", " + lat + "));map.addOverlay(marker1);</script>"; //进入可编辑模式前存好
	ifrdoc.designMode = "on"; //文档进入可编辑模式
	ifrdoc.open(); //打开流
	ifrdoc.write(s); 
	ifrdoc.close(); //关闭流
	ifrdoc.designMode ="off"; //文档进入非可编辑模式
}

function showPDF(src) {
	/*
	var exec = require('child_process').execFile;
	exec('../pdf.exe',[src],{},null);
	*/
	var div = document.createElement("div");
	div.style.cssText = "position:absolute;left:0;top:0;z-index:1000;width:100%;height:100%;background-color:black;";
	
	var back = document.createElement("div");
	back.addEventListener("click", function(){
		document.body.removeChild(this.parentNode);
	}, false);
	back.style.cssText = "z-index:1000;position:absolute;left:0;top:0;width:100px;height:100px;background:url(images/back_larrow.png) center center no-repeat;";
	div.appendChild(back);
	
	var ifr = document.createElement("iframe");
	ifr.style.cssText = "border:0;height:100%;width:"+(document.documentElement.clientWidth - 200)+"px;margin-left:100px;";
	div.appendChild(ifr);
	document.body.appendChild(div);
	
	var ifrdoc = ifr.contentWindow.document;
	var s = '<style>body{margin:0;}</style><embed width="100%" height="100%" name="plugin" src="'+src+'" type="application/pdf" />';
	ifrdoc.designMode = "on"; //文档进入可编辑模式
	ifrdoc.open(); //打开流
	ifrdoc.write(s); 
	ifrdoc.close(); //关闭流
	ifrdoc.designMode ="off"; //文档进入非可编辑模式
}