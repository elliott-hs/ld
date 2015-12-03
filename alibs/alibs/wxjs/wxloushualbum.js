var Album = (function(){
	var pagew = document.documentElement.clientWidth,
		pageh = document.documentElement.clientHeight;

	var album = function(el, arr){
		this.container = typeof el == "string" ? document.querySelector(el) : el;
		this.scroller = this.container.children[0];
		
		this.container.style.width = pagew + "px";
		this.container.style.height = pageh + "px";
		this.container.style.backgroundColor = "black";
		//this.scroller.style.height = pageh + "px";
		
		this.arr = arr;
		this.scroll = null;
		
		this.newScrollRight();
		this.initPoint(0);
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
			
			this.newScroll();
			this.scroll.scrollToPage(toPageIndex, 0, 0);
		},
		
		getCurrIndex: function(){
			var currIndex = this.scroll.scroller.querySelectorAll("img")[this.scroll.currPageX].attributes["index"].nodeValue * 1;
			this.initPoint(currIndex);
			return currIndex;
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
			
			this.newScroll();
			this.scroll.scrollToPage(1, 0, 0);
		},
		
		newScroll: function() {
			var that = this;
			var yy = 0;
			if(this.scroll)
				var yy = this.scroll.y;
			this.scroll = new iScroll(this.container, {y:yy,scrollX:true, scrollY:true,vScrollbar:false, bounce:false,
				snap: true, momentum: false, freeScroll: true,
				hScrollbar:false, snapThreshold: 50,
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
					return;// new
					if (this.scale == 2) this.options.snap = false;
					else this.options.snap = true;
				}
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
				"	<img style='width:100%;' index='"+index+"' src='"+this.arr[index]+"' onclick='showImages("+index+")' />" + 
				"</div>";
		},
		
		initPoint: function(index){
			if($('.point').length > 0){
				$('.point').removeClass('selected');
				$('.point').eq(index).addClass('selected');
				var hh = document.documentElement.clientHeight;
				$('.point').css('top', parseInt(10) + 'px');
				return;
			}
			
			var item = 11 + 10;
			var total = item * this.arr.length - 10;
				
			for(var i=0; i<this.arr.length; i++){
				var left = parseInt((pagew - total)/2) + i * item;
				var div = $('<div class="point"></div>');
				div.css('left', left + 'px');
				div.css('top', parseInt(pageh * 0.1) + 'px');
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