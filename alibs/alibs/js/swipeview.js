var SwipeView = (function () {
    var dummyStyle = document.createElement('div').style,
        has3d = 'webkitPerspective' in dummyStyle,
        translateZ = has3d ? ' translateZ(0)' : '',
        cssVendor = "-webkit-",
		transitionDuration = "webkitTransitionDuration",
		transitionEndEvent = "webkitTransitionEnd",
		transform = "webkitTransform",
		hasTouch = 'ontouchstart' in window,
		startEvent = hasTouch ? 'touchstart' : 'mousedown',
		moveEvent = hasTouch ? 'touchmove' : 'mousemove',
		endEvent = hasTouch ? 'touchend' : 'mouseup';

    var sv = function (el, options) {
        this.upcomingIndex = [];
        this.upcomingPageIndex = [];
        this.customEvents = [];
        this.masterPagesIndex = [0, 1, 2];

        this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
        this.wrapper.style.overflow = 'hidden';
        this.wrapper.style.position = 'relative';
        this.wrapper.innerHTML = "";
        this.options = {
            numberOfPages: 3,
            hastyPageFlip: false,
            loop: false,
            isfollow: true
        };

        var i, pageIndex;
        for (i in options) this.options[i] = options[i];

        var div = document.createElement("div");
        div.style.cssText = 'position:relative;top:0;height:100%;width:100%;-webkit-transition-property:-webkit-transform;'
			+ cssVendor + 'transition-duration:0;' + cssVendor + 'transform:translateZ(0);'
			+ cssVendor + 'backface-visibility: hidden;';
        this.wrapper.appendChild(div);
        this.slider = div;

        this.wrapper.addEventListener(startEvent, this, false);
        this.wrapper.addEventListener(moveEvent, this, false);
        this.wrapper.addEventListener(endEvent, this, false);
        this.slider.addEventListener(transitionEndEvent, this, false);

        this.masterPages = [];
        for (i = -1; i < 2; i++) {
            div = document.createElement('div');
            div.id = 'swipeview-masterpage-' + (i + 1);
            div.style.cssText = cssVendor + 'transform:translateZ(0);position:absolute;top:0;height:100%;width:100%;left:' + i * 100 + '%';

            if (!this.options.loop && i == -1) div.style.visibility = 'hidden';

            this.slider.appendChild(div);
            this.masterPages.push(div);
        }
    }

    sv.prototype = {
        /* public */
        pageIndex: 0,
        lastPageIndex: 0,
        enabled: true,

        onFlip: function (fn) {
            this.wrapper.addEventListener('swipeview-flip', fn, false);
            this.customEvents.push(['flip', fn]);
        },

        onHidden: function (fn) {
            this.wrapper.addEventListener('swipeview-hidden', fn, false);
            this.customEvents.push(['hidden', fn]);
        },

        goToPage: function (pageIndex) {
            pageIndex = parseFloat(pageIndex);
            if (this.pageIndex == pageIndex) return;

            this.slider.style[transitionDuration] = '0ms';
            var width = this.wrapper.offsetWidth;
            this._pos(0 - (pageIndex * width));

            this._changeorder(3, pageIndex);
            this.pageIndex = pageIndex;
            this._setUnloadPage();
            this.lastPageIndex = pageIndex;
            this._event('flip');
        },

        removeshade: function () {
            var shades = this.wrapper.querySelectorAll(".swipeview-shade");
            if (shades.length == 0) return;

            var i;
            for (i = 0; i < shades.length; i++) {
                shades[i].outerHTML = "";
            }
        },

        destroy: function () {
            while (this.customEvents.length) {
                this.wrapper.removeEventListener('swipeview-' + this.customEvents[0][0], this.customEvents[0][1], false);
                this.customEvents.shift();
            }

            this.wrapper.removeEventListener(startEvent, this, false);
            this.wrapper.removeEventListener(moveEvent, this, false);
            this.wrapper.removeEventListener(endEvent, this, false);
            this.slider.removeEventListener(transitionEndEvent, this, false);
        },

        /* private */
        startmove: false,
        x: 0,
        y: 0,
        mindist: 20,

        handleEvent: function (e) {
            switch (e.type) {
                case startEvent:
                    this._start(e);
                    break;
                case moveEvent:
                    this._move(e);
                    break;
                case endEvent:
                    this._end(e);
                    break;
                case transitionEndEvent:
                    this._hidden();
                    if (e.target == this.slider && !this.options.hastyPageFlip) {
                        this._flip();
                    };
                    break;
            }
        },

        _flip: function () {
            if (this.lastPageIndex == this.pageIndex) return;

            this._setUnloadPage();
            this.lastPageIndex = this.pageIndex;
            this._event('flip');
        },

        _hidden: function () {
            if (Math.abs(this.lastPageIndex - this.pageIndex) != 1) return;
            this._event('hidden');
        },

        _setUnloadPage: function () {
            this.upcomingIndex = [];
            this.upcomingPageIndex = [];


            var dist = this.pageIndex - this.lastPageIndex,
				distabs = Math.abs(dist);

            if (distabs == 1) {
                if (dist > 0) {
                    this.upcomingIndex.push(this.masterPagesIndex[2]);
                    this.upcomingPageIndex.push(this._modifyPageIndex(this.pageIndex + 1));

                }
                else {
                    this.upcomingIndex.push(this.masterPagesIndex[0]);
                    this.upcomingPageIndex.push(this._modifyPageIndex(this.pageIndex - 1));
                }
            }
            else if (distabs == 2) {
                if (dist > 0) {
                    this.upcomingIndex.push(this.masterPagesIndex[2]);
                    this.upcomingIndex.push(this.masterPagesIndex[1]);
                    this.upcomingPageIndex.push(this._modifyPageIndex(this.pageIndex + 1));
                    this.upcomingPageIndex.push(this.pageIndex);
                }
                else {
                    this.upcomingIndex.push(this.masterPagesIndex[0]);
                    this.upcomingIndex.push(this.masterPagesIndex[1]);
                    this.upcomingPageIndex.push(this._modifyPageIndex(this.pageIndex - 1));
                    this.upcomingPageIndex.push(this.pageIndex);
                }
            }
            else {
                this.upcomingIndex.push(this.masterPagesIndex[0]);
                this.upcomingIndex.push(this.masterPagesIndex[1]);
                this.upcomingIndex.push(this.masterPagesIndex[2]);
                this.upcomingPageIndex.push(this._modifyPageIndex(this.pageIndex - 1));
                this.upcomingPageIndex.push(this.pageIndex);
                this.upcomingPageIndex.push(this._modifyPageIndex(this.pageIndex + 1));
            }
        },

        _event: function (type) {
            var ev = document.createEvent("Event");
            ev.initEvent('swipeview-' + type, true, true);
            this.wrapper.dispatchEvent(ev);
        },

        _start: function (e) {
            this.startmove = true;

            var point = hasTouch ? e.touches[0] : e;
            this.startX = point.pageX;
            this.startY = point.pageY;
            this.sliderX = this.x;
            this.slider.style[transitionDuration] = '0ms';
            if (!hasTouch) e.preventDefault();
        },

        _move: function (e) {
            if (!this.startmove || !this.enabled) return;

            var point = hasTouch ? e.touches[0] : e,
                distX = point.pageX - this.startX,
                distY = point.pageY - this.startY;

            if (Math.abs(distY) > Math.abs(distX)) {
                this.startmove = false;
                return;
            }

            if (this.options.isfollow) this._pos(this.sliderX + distX);
            else this.x = this.sliderX + distX;
        },

        _end: function (e) {
            this.startmove = false;

            var dist = this.x - this.sliderX,
				width = this.wrapper.offsetWidth,
				curPageIndex;

            if (dist == 0) return;
            this.slider.style[transitionDuration] = '300ms';
            if (Math.abs(dist) < this.mindist) {
                this._pos((0 - this.pageIndex) * width);
            }
            else {
                curPageIndex = this.pageIndex;
                this._pos(this._getpos(dist));
                if (curPageIndex != this.pageIndex) {
                    if (curPageIndex < this.pageIndex) this._changeorder(0);
                    else if (curPageIndex > this.pageIndex) this._changeorder(1);

                    if (this.options.hastyPageFlip) {
                        this.lastPageIndex = curPageIndex;
                        this._setUnloadPage();
                        this._event('flip');
                    }
                }
            } 
        },

        _pos: function (x) {
            this.x = x;
            this.slider.style[transform] = 'translate(' + x + 'px,0) ' + translateZ;
        },

        _getpos: function (dist) {
            var width = this.wrapper.offsetWidth;
            if (dist < 0) {
                if (this.pageIndex != this.options.numberOfPages - 1) {
                    this.pageIndex = Math.abs(Math.ceil(this.x / width) - 1);
                }
            }
            else if (dist > 0) {
                if (this.pageIndex != 0) {
                    this.pageIndex = Math.abs(Math.ceil(this.x / width));
                }
            }

            return (0 - this.pageIndex) * width;
        },

        _modifyPageIndex: function (index) {
            if (index > this.options.numberOfPages - 1) return 0;
            else if (index < 0) return this.options.numberOfPages - 1;
            else return index;
        },

        _changeorder: function (flag, pageIndex) {
            var div,
				leftvalue,
				i,
				count;

            if (flag == 0) {
                div = this.masterPages[this.masterPagesIndex[0]];
                leftvalue = (parseFloat(this.masterPages[this.masterPagesIndex[2]].style.left) + 100) + "%";
                this.masterPagesIndex = [this.masterPagesIndex[1], this.masterPagesIndex[2], this.masterPagesIndex[0]];
            }
            else if (flag == 1) {
                div = this.masterPages[this.masterPagesIndex[2]];
                leftvalue = (parseFloat(this.masterPages[this.masterPagesIndex[0]].style.left) - 100) + "%";
                this.masterPagesIndex = [this.masterPagesIndex[2], this.masterPagesIndex[0], this.masterPagesIndex[1]];
            }
            else {
                count = Math.abs(this.pageIndex - pageIndex);
                for (i = 0; i < count; i++) {
                    if (pageIndex > this.pageIndex) this.masterPagesIndex = [this.masterPagesIndex[1], this.masterPagesIndex[2], this.masterPagesIndex[0]];
                    else this.masterPagesIndex = [this.masterPagesIndex[2], this.masterPagesIndex[0], this.masterPagesIndex[1]];
                }

                for (i = 0; i < this.masterPagesIndex.length; i++) {
                    this.masterPages[this.masterPagesIndex[i]].style.left = ((pageIndex - 1 + i) * 100) + "%";
                }

                if (pageIndex == this.options.numberOfPages - 1) {
                    this.masterPages[this.masterPagesIndex[0]].style.visibility = "visible";
                    this.masterPages[this.masterPagesIndex[1]].style.visibility = "visible";
                    this.masterPages[this.masterPagesIndex[2]].style.visibility = "hidden";
                }
                else if (pageIndex == 0) {
                    this.masterPages[this.masterPagesIndex[0]].style.visibility = "hidden";
                    this.masterPages[this.masterPagesIndex[1]].style.visibility = "visible";
                    this.masterPages[this.masterPagesIndex[2]].style.visibility = "visible";
                }
                else {
                    for (i = 0; i < this.masterPagesIndex.length; i++) {
                        this.masterPages[this.masterPagesIndex[i]].style.visibility = "visible";
                    }
                }
            }

            if (div) {
                if ((flag == 0 && this.pageIndex == this.options.numberOfPages - 1)
					|| (flag == 1 && this.pageIndex == 0)) {
                    div.style.visibility = "hidden";
                }
                else {
                    if (!this.options.hastyPageFlip) div.appendChild(this._getshade());
                    div.style.visibility = "visible";
                }

                div.style.left = leftvalue;
            }
        },

        _getshade: function () {
            var div = document.createElement("div");
            div.style.cssText = "width:100%;height:100%;background-color:black;position:absolute;top:0;left:0;display:" + cssVendor
                + "box;" + cssVendor + "box-orient: horizontal;" + cssVendor + "box-pack: center;" + cssVendor + "box-align: center;"
            div.className = "swipeview-shade";

            var text = document.createElement("div");
            text.style.cssText = "width:100px;height:100px;font-size:32px;color:#eee;";
            text.innerHTML = "loading";
            div.appendChild(text);
            return div;
        }
    }

    return sv;
})();