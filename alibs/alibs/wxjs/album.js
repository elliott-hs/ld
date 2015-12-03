var Album = (function(){
	var pagew = document.documentElement.clientWidth,
		pageh = document.documentElement.clientHeight;

	var album = function(el, arr){
		this.container = typeof el == "string" ? document.querySelector(el) : el;
		this.scroller = this.container.children[0];
		
		this.container.style.width = pagew + "px";
		this.container.style.height = pageh + "px";
		this.container.style.backgroundColor = "black";
		this.scroller.style.height = pageh + "px";
		
		this.arr = arr;
		this.scroll = null;
		
		this.newScrollRight();
	}
	
	album.prototype = {
		lastIndex: 0,
	
		newScrollRight: function(){
			var toPageIndex = 0;
			var index = 0;
			if (this.scroll) {
				index = this.getCurrIndex();
				toPageIndex = 1;
				this.scroll.destroy();
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
			
			this.scroller.style.width = ((end - start) * pagew) + "px";
			this.scroller.innerHTML = html;
			this.bindImgScaleEvent();
			
			this.newScroll();
			this.scroll.scrollToPage(toPageIndex, 0, 0);
		},
		
		getCurrIndex: function(){
			return this.scroll.scroller.querySelectorAll("img")[this.scroll.currPageX].attributes["index"].nodeValue * 1;
		},
		
		newScrollLeft: function() {
			if (!this.scroll) return;

			var html = "",
				index = this.getCurrIndex(scroll),
				len = 3,
				i;
				
			this.scroll.destroy();
			for (var i = index - 1; i < index - 1 + len; i++) {
				html += this.getHtml(i);
			}
			
			this.scroller.style.width = (len * pagew) + "px";
			this.scroller.innerHTML = html;
			this.bindImgScaleEvent();
			
			this.newScroll();
			this.scroll.scrollToPage(1, 0, 0);
		},
		
		newScroll: function() {
			var that = this;
			this.scroll = new iScroll(this.container, {
				snap: true, momentum: false, useTransition:true,
				hScrollbar:false, snapThreshold: 100,
				onScrollEnd: function() {
					var index = that.getCurrIndex();
					if (index > that.lastIndex) {
						// 向后翻页
						if (this.currPageX == 2 && index < that.arr.length - 1) {
							that.newScrollRight();
						}
					}
					else if (index < that.lastIndex) {
						// 向前翻页
						if (this.currPageX == 0 && index != 0) {
							that.newScrollLeft();
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
		
		bindImgScaleEvent: function(){
			var imgs = this.scroller.querySelectorAll("img"),
				eventName = ("ontouchmove" in window) ? "click" : "dblclick",
				that = this,
				i;
				
			for (i = 0; i < imgs.length; i++) {
				imgs[i].addEventListener(eventName, function(){
					that.showScaleImage(this);
				}, false);
			}
		},
		
		showScaleImage: function(obj) {
			var w = obj.width * 1.5,
				h = obj.height * 1.5,
				eventName = ("ontouchmove" in window) ? "click" : "dblclick";
		
			var c = document.createElement("div");
			c.style.cssText = "background-color:black;width:"+pagew+"px;height:"+pageh+"px;position:absolute;top:0;left:0;"
			c.addEventListener(eventName, function() {
				this.parentNode.removeChild(this);
			}, false);
			
			var s = document.createElement("div");
			s.style.cssText = "width:"+w+"px;height:"+h+"px;"
			
			var img = document.createElement("img");
			img.src = obj.src;
			img.width = w;
			img.height = h;
			s.appendChild(img);
			
			c.appendChild(s);
			document.body.appendChild(c);
			
			new iScroll(c, {
				zoom: true, hScrollbar: false, bounce: true, vScrollbar: false, momentum: false, 
				useTransition: true, zoomMin: 1, zoomMax: 2
			});
		},
		
		getHtml: function(index){
			return "<div style='" +
				"width:"+pagew+"px;" +
				"height:100%;" +
				"float:left;" +
				"display: -webkit-box;" +
				"-webkit-box-orient: horizontal;" + 
				"-webkit-box-pack: center;" + 
				"-webkit-box-align: center;'>" + 
				"	<img index='"+index+"' src='"+this.arr[index]+"' width='100%' onload='"+this.fimg()+"' />" + 
				"</div>";
		},
		
		fimg: function(){
			return "var h = document.documentElement.clientHeight; if (this.height > h) {this.height = h;}";
		}
	};
	
	return album;
})();