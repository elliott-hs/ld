var Display = (function () {
    var cssVendor = "-webkit-",
		transitionDuration = "webkitTransitionDuration",
        transitionEndEvent = "webkitTransitionEnd",
		transform = "webkitTransform",
		hasTouch = 'ontouchstart' in window,
		startEvent = hasTouch ? 'touchstart' : 'mousedown',
		endEvent = hasTouch ? 'touchend' : 'mouseup';

    var _display = function (el, options) {
        this.options = {
            interval: 3000,
            val: 350,
            type: 0
        };

        var i;
        for (i in options) this.options[i] = options[i];

        this.el = el;
        this.container = typeof el == 'string' ? document.querySelector(el) : el;
        this.container.style.display = "block";
        this.images = this.container.querySelectorAll("img");

        this.container.style.position = "relative";
        if (this.options.type == 1) {
            this._initscroll();
        }
        else {
            this._initimg();
            this._bindevent();
        }

        if (this.options.interval) this._createtimer();
    };

    _display.prototype = {
        index: 0,

        _initimg: function () {
            var len = this.images.length,
                img,
                i;

            for (i = 0; i < len; i++) {
                img = this.images[i];
                img.style.position = "absolute";
                img.style.top = "0";
                img.style.left = "0";
                img.style[transform] = "translate3d(0,0,0)";
                if (i > 0) img.style.opacity = "0";
                img.style[transitionDuration] = this.options.val + "ms";
            }

            var that = this, firstimg;
            if (len > 0) {
                firstimg = that.images[0];
                if (firstimg.height) {
                    that.container.style.height = firstimg.height;
                    that.height = firstimg.height;
                    that.width = firstimg.width;
                    that._createindex();
                }
                else {
                    firstimg.onload = function () {
                        that.container.style.height = this.height;
                        that.height = this.height;
                        that.width = this.width;
                        that._createindex();
                    }
                }
            }
        },

        _initscroll: function (el) {
            var imgs = this.images,
                len = imgs.length,
                el = this.container;
            if (len == 0) return;

            var i;
            for (i = 0; i < len; i++) {
                imgs[i].style.float = "left";
            }

            var firstimg = imgs[0], that = this;

            var s = function (w, h) {
                var i;
                for (i = 0; i < len; i++) {
                    imgs[i].style.width = w + 'px';
                }

                var container = document.createElement("div");
                container.innerHTML = el.innerHTML;
                el.innerHTML = "";
                el.appendChild(container);
                container.style.height = h + "px";
                el.style.height = h + "px";
                container.style.width = (w * len) + "px";
                that.scroll = new iScroll(el, {
                    hScrollbar: false, vScrollbar: false, vScroll: false, bounce: true, snap: true,
                    momentum: false, useTransition: true,
                    onBeforeScrollStart: function () {
                    },
                    onScrollEnd: function () {
                        that.index = this.currPageX;
                        that._changeindex();
                    },
					ontouchstart: function(){
						 that.style.overflow = 'hidden';
					}
                });

                that.width = w;
                that.height = h;
                that._createindex();
            }

			var isShowWindow = false;
            if (this.options.preWidth && this.options.preHeight) {
                s(this.options.preWidth, this.options.preHeight);
            }
            else {
				// 1：当 高度存在，并且 宽度小于设备宽度时候，我们假设认为图片加载好了。 
				// 2：缺点是，如果这个图片恰好小于屏幕宽度
				// 3：如果去掉firstimg.width < document.documentElement.clientWidth这个，会导致，图片刚加载好，但是样式还没有渲染好。
				// 例如屏幕宽度320， 图片600宽度，图片加载好了，样式没渲染好， 这个时候生成的橱窗会导致图片很大。
                if (firstimg.height) {
					if (firstimg.width <= document.documentElement.clientWidth)
						s(firstimg.width, firstimg.height);
					else {
						showWindowWhenloadedImg();
					}
                }
                else {
                    firstimg.onload = function () {
						if(isShowWindow) return;
						isShowWindow = true;
                        s(this.width, this.height);
                    }
                }
            }
			
			// 
			var time = 0;
			function showWindowWhenloadedImg(){
				if(time > 1000) return;
				if(firstimg.height && firstimg.width <= document.documentElement.clientWidth){
					if(isShowWindow) return;
					isShowWindow = true;
					s(firstimg.width, firstimg.height);
					return;
				}
				time = time + 10;
				setTimeout(function(){
					showWindowWhenloadedImg();
				},10);
			}
        },

        _bindevent: function () {
            this.container.addEventListener(startEvent, this, false);
            this.container.addEventListener(endEvent, this, false);
        },

        handleEvent: function (e) {
            switch (e.type) {
                case startEvent:
                    this._start(e);
                    break;
                case endEvent:
                    this._end(e);
                    break;
            }
        },

        _start: function (e) {
            this.startX = e.pageX;
        },

        _end: function (e) {
            var dist = e.pageX - this.startX;
            if (Math.abs(dist) < 20) return;

            this.images[this.index].style.opacity = 0;
            if (dist < 0) {
                this.index++;
                if (this.index > this.images.length - 1) this.index = 0;
            }
            else {
                this.index--;
                if (this.index < 0) this.index = this.images.length - 1;
            }
            this.images[this.index].style.opacity = 1;
            this._changeindex();
        },

        _createindex: function () {
            var i, len = this.images.length,
                indexdiv = document.createElement("div"),
                subdiv,
                w = 6;

            indexdiv.style.cssText = "left:" + ((this.width - (len * 2 - 1) * w) / 2)
                + "px;text-align:center;position:absolute;top:" + (this.height - w * 2) + "px;";
            for (i = 0; i < len; i++) {
                subdiv = document.createElement("div");
                subdiv.style.cssText = "width:" + w + "px;float:left; margin-left:6px;height:" + w
                    + "px;-webkit-border-radius: " + (w / 2) + "px;background-color:#656565;";

                if (i == this.index) subdiv.style.backgroundColor = "#cccccc";
                indexdiv.appendChild(subdiv);
            }

            this.container.appendChild(indexdiv);
            this.indexdiv = indexdiv;
        },

        _createtimer: function () {
            var that = this;
            this.timer = window.setInterval(function () {
                if (!that._checkexists()) return;

                if (that.options.type == 0) {
                    that.images[that.index].style.opacity = 0;
                    that.index++;
                    if (that.index > that.images.length - 1) that.index = 0;
                    that.images[that.index].style.opacity = 1;
                    that._changeindex();
                }
                else {
                    that.index++;
                    var tm = 350;
                    if (that.index > that.images.length - 1) {
                        that.index = 0;
                        tm = 0;
                    }
                    if (that.scroll) that.scroll.scrollToPage(that.index, 0, tm);
                }
            }, this.options.interval);
        },

        _changeindex: function () {
            var divs = this.indexdiv.querySelectorAll("div"),
                i;

            for (i = 0; i < divs.length; i++) {
                if (i == this.index) divs[i].style.backgroundColor = "#cccccc";
                else divs[i].style.backgroundColor = "#656565";
            }
        },

        _checkexists: function () {
            var id = typeof this.el == 'string' ? this.el : this.el.id,
                el = document.querySelector(id);

            if (!el && this.timer) {
                this.destroy();
                return false;
            }

            return true;
        },

        destroy: function () {
            window.clearInterval(this.timer);
        }
    };

    return _display;
})();