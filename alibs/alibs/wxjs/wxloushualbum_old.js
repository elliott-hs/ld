var AlbumInfo = {};
var Album = (function() {
	var pagew = document.documentElement.clientWidth,
		pageh = document.documentElement.clientHeight;

	var album = function(el, arr, onScrollEnd, toIndex, options){
		if (options) {
			pagew = options.width || pagew;
			pageh = options.height || pageh;
		}
	
		this.key = Math.random().toString().substring(2);
		AlbumInfo[this.key] = this;
		
		this.driver1 = {};
		this.driver1.id = 0;
		this.driver1.container = typeof el == "string" ? document.querySelector(el) : el;
		this.driver1.scroller = this.driver1.container.children[0];
		this.driver1.container.style.width = pagew + "px";
		this.driver1.container.style.height = pageh + "px";
		this.driver1.container.style.backgroundColor = "black";
		this.driver1.container.style.position = "absolute";
		this.driver1.container.style.visibility = "hidden";
		this.driver1.container.style.display = "none";
		this.driver1.container.style.left = "0";
		this.driver1.container.style.top = "0";
		this.driver1.scroller.style.height = pageh + "px";
		this.driver1.scroll = null;
		
		this.driver2 = {};
		this.driver2.id = 1;
		this.driver2.container = document.createElement("div");
		this.driver2.container.style.cssText = this.driver1.container.style.cssText;
		this.driver2.container.className = this.driver1.container.className;
		this.driver2.scroller = document.createElement("div");
		this.driver2.container.appendChild(this.driver2.scroller);
		document.body.appendChild(this.driver2.container);
		
		this.activeDriver = null;
		this.arr = arr;
		this.onScrollEnd = onScrollEnd;
		
		this.newScrollRight(toIndex);
	}
	
	album.prototype = {
		lastIndex: 0,
	
		newScrollRight: function(toIndex){
			var toPageIndex = 0;
			var index = 0;
			if (toIndex != undefined) {
				if (toIndex < 2) {
					toPageIndex = toIndex;
				}
				else {
					index = toIndex;
					toPageIndex = 1;
				}
			}
			else if (this.activeDriver != null) {
				index = this.getCurrIndex(this.activeDriver.scroll);
				toPageIndex = 1;
				//this.driver1.scroll.destroy();
			}
			
			var html = "",
				len = 3,
				start = 0,
				end = 0;
				
			if (index == 0) {
				for (var i = 0; i < len; i++) {
					if (i < this.arr.length) html += this.getHtml(i);
					else break;
					end++;
				}
			}
			else {
				start = index - 1;
				end = (index - 1 + len) > this.arr.length ? this.arr.length : (index - 1 + len);
				for (var i = index - 1; i < end; i++) {
					html += this.getHtml(i);
				}
			}
			
			var driver = this.getFreeDriver();
			driver.scroller.style.width = ((end - start) * pagew) + "px";
			driver.scroller.innerHTML = html;
			//this.bindImgScaleEvent();
			
			driver.container.style.display = "block";
			this.newScroll(driver);
			driver.scroll.scrollToPage(toPageIndex, 0, 0);
			driver.container.style.visibility = "visible";
			if (this.activeDriver != null) {
				this.activeDriver.scroll.destroy();
				this.activeDriver.container.style.display = "none";
				this.activeDriver.container.style.visibility = "hidden";
			}
			this.activeDriver = driver;
		},
		
		getCurrIndex: function(scroll) {
			var currIndex = scroll.scroller.querySelectorAll("div")[scroll.currPageX].attributes["index"].nodeValue * 1;
			this.initPoint(currIndex);
			return currIndex;
		},
		
		newScrollLeft: function() {
			var driver = this.getFreeDriver();
			var html = "",
				index = this.getCurrIndex(this.activeDriver.scroll),
				len = 3,
				i;
				
			//this.driver1.scroll.destroy();
			for (var i = index - 1; i < index - 1 + len; i++) {
				html += this.getHtml(i);
			}
			
			driver.scroller.style.width = (len * pagew) + "px";
			driver.scroller.innerHTML = html;
			//this.bindImgScaleEvent();
			
			driver.container.style.display = "block";
			this.newScroll(driver);
			driver.scroll.scrollToPage(1, 0, 0);
			driver.container.style.visibility = "visible";
			if (this.activeDriver != null) {
				this.activeDriver.scroll.destroy();
				this.activeDriver.container.style.visibility = "hidden";
				this.activeDriver.container.style.display = "none";
			}
			this.activeDriver = driver;
		},
		
		newScroll: function (driver) {
			var that = this;
			driver.scroll = new iScroll(driver.container, {
				snap: true, momentum: false, useTransition:true,
				hScrollbar:false, snapThreshold: 10,
				onScrollEnd: function () {
					var index = that.getCurrIndex(this);
					if (index > that.lastIndex) {
						if (this.currPageX == 2 && index < that.arr.length - 1) {
							that.newScrollRight();
						}
						else {
							if (that.onScrollEnd) that.onScrollEnd(index);
						}
					}
					else if (index < that.lastIndex) {
						if (this.currPageX == 0 && index != 0) {
							that.newScrollLeft();
						}
						else {
							if (that.onScrollEnd) that.onScrollEnd(index);
						}
					}
					that.lastIndex = index;
				},
				onZoomEnd: function(){
					if (this.scale == 2) this.options.snap = false;
					else this.options.snap = true;
				}
			});
		},
		
		getHtml: function(index) {
			return "<div index='"+index+"' style='" +
				"width:"+pagew+"px;" +
				"height:"+pageh+"px;" + 
				"float:left;background:url("+this.arr[index]+") center center no-repeat;background-size: contain;' onclick='showImages("+index+")'>" + 
				"</div>";
		},
		
		getFreeDriver: function(){
			if (this.activeDriver == null || this.activeDriver.id == 1) 
				return this.driver1;
			else return this.driver2;
		},
		
		initPoint: function(index){
			if($('.point').length > 0){
				$('.point').removeClass('selected');
				$('.point').eq(index).addClass('selected');
				var hh = document.documentElement.clientHeight;
				if(top.btnH){
					$('.point').css('top', parseInt(hh - top.btnH - 8) + 'px');
				}else{
					$('.point').css('top', parseInt(hh * 0.90) + 'px');
				}
				return;
			}
			
			var item = 11 + 10;
			var total = item * this.arr.length - 10;
				
			for(var i=0; i<this.arr.length; i++){
				var left = parseInt((pagew - total)/2) + i * item;
				var div = $('<div class="point"></div>');
				div.css('left', left + 'px');
				div.css('top', parseInt(pageh * 0.82) + 'px');
				div.css('background-size', '6px 6px');
				div.css('background-positon', 'center center');
				div.css('background-repeat', 'no-repeat');
				$(document.body).append(div);
			}
			this.initPoint(0);
		}
	};
	
	return album;
})();