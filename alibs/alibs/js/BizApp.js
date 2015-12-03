var BizApp = (function () {
    var dummyStyle = document.createElement('div').style,
        has3d = 'webkitPerspective' in dummyStyle,
		transitionEndEvent = "webkitTransitionEnd",
        translateZ = has3d ? ' translateZ(0)' : '',
        isPC = navigator.userAgent.indexOf("Windows NT") >= 0,
        isAndroid = (function () {
            var ua = navigator.userAgent,
            _isAndroid = ua.indexOf('Android') > -1 || ua.indexOf('Linux') > -1;

            return _isAndroid;
        })(),
        isIos = !!navigator.userAgent.match(/(i[^;]+\;(U;)? CPU.+Mac OS X)/),
        isPad = navigator.userAgent.toLowerCase().match(/iPad/i) == "ipad",
        deviceType = isPC ? "pc" : (isAndroid ? "android" : "ios"),
        appType = isAndroid ? "android" : "ios",
        allStyle = {
            cover: 0,
            slider: 1
        };

    var _bizapp = function (el, options) {
        switch (config.AnimateStyle) {
            case 0:
                if (isAndroid) this.animateStyle = allStyle.slider;
                else this.animateStyle = allStyle.cover;
                break;
            case 1:
                this.animateStyle = allStyle.slider;
                break;
            case 2:
            case 3:
                this.animateStyle = allStyle.cover;
                break;
            default:
                break;
        }

        // size
        this.width = document.documentElement.clientWidth;
        if (isPC || isAndroid || isPad) {
            this.height = document.documentElement.clientHeight;
        }
        else {
            this.height = window.screen.height - 20;
        }

        // dom
        this.container = typeof el == "string" ? document.querySelector(el) : el;
        this.sliderObj = this.container.querySelector("div");
        this.container.style.cssText = "width:" + this.width + "px;height:" + this.height
            + "px;position:absolute;overflow:hidden;z-index:1;";
        this.sliderObj.style.cssText = "height:" + this.height + "px;width:" + this.width + "px;";

        // var 
        this.canHide = true;
        this.clicktime = 0;
        this.pagelist = [];
        this.options = {};
        if ("FileTransfer" in window) {
            this.fileTransfer = new FileTransfer();
        }

        var i;
        for (i in options) this.options[i] = options[i];

        var that = this;
        if (this.animateStyle == allStyle.slider) {
            this.scroll = new iScroll(this.container, {
                hScrollbar: false, momentum: false, snap: true, vScroll: false,
                bounce: false, useTransition: true,
                onScrollEnd: function () {
                    if (that.isRemove) {
                        var scrollpages = that.sliderObj.querySelectorAll(".scroll_page"),
                            lastindex = scrollpages.length - 1;

                        that._removepage(scrollpages[lastindex]);

                        that.sliderObj.style.width = (lastindex * that.width) + "px";
                        that.isRemove = false;
                    }
                }
            });
            this.scroll.disable();
        }

        this._showdefaultpage();

        if (config.ShowHeadPage) {
            this.container.style.visibility = "hidden";
            this._showheadpage();
        }
        else if (config.HasAnimate) {
            this.container.style.visibility = "hidden";
            this._showAnimateStart();
        }
    }

    _bizapp.prototype = {
        showpage: function (tpid, index) {
            if (config.TpInfo[tpid].ShowType != -1 && !this.checkdblclick()) return;

            console.log(tpid);

            if (config.TpInfo[tpid].Url.length == 1) {
                var html = this._loadpage(config.TpInfo[tpid].Url[0]);
                if (this.animateStyle == allStyle.cover)
                    this._cover.createpage.call(this, html, tpid);
                else if (this.animateStyle == allStyle.slider) {
                    this._slider.createpage.call(this, html, tpid);
                }
            }
            else {
                if (this.animateStyle == allStyle.cover) {
                    this._cover.createswipeview.call(this, tpid, index);
                }
                else {
                    this._slider.createScroll.call(this, tpid, index);
                }
            }
            this.pagelist.push(tpid);
            this.log(tpid, index);
        },
        //推送
        showPushPage: function (contentId) {
            if (!navigator.onLine) {
                maopao("加载失败，请检测您的网络～");
                return;
            }
            this._showHud();
            var url = "http://a.mo2.cn/api/ListResourceInfo?appname=" + config.AppName
                + "&contentId=" + contentId + "&apptype=" + appType;
            var that = this;
            $.getJSON(url, function (data) {
                that._downLoadFiles(data, function () {
                    that._hideHud();
                    that.showpage("html_" + contentId);
                });
            });
        },
		
		/**
		 * 返回这层级的顶级
		 */
		goBackTopPage: function(){
			if(isAndroid){
				var l = $('.scroll_page').length-1;
				this.scroll.scrollToPage(0, 0, 0);
				var scrollpages = this.sliderObj.querySelectorAll(".scroll_page");
                for(var i=1; i<scrollpages.length; i++){
                        this._removepage(scrollpages[i]);
				}
                this.sliderObj.style.width = (1 * this.width) + "px";
                this.isRemove = false;
			}else if(isIos || isPad){
				var l = $('.bizapp_move').length;
				for(var i = 0; i < l; i++){
					this.canHide=true;
					this.hidepage();
				}
			}
		},
		
        hidepage: function () {
            //if (!this.checkdblclick()) return;

            if (this.container.style.display == "none") {
                this.container.style.display = "block";
            }

            if (isAndroid && document.getElementById("divShare")) {
                this._cover.hidepage.call(this);
                return;
            }
			
            switch (this.animateStyle) {
                case allStyle.cover:
                    this._cover.hidepage.call(this);
                    break;
                case allStyle.slider:
                    this._slider.hidepage.call(this);
                    break;
                default:
                    break;
            }

            //event.stopPropagation();
            if (event) {
                event.preventDefault();
            }
        },

        showimages: function (img) {
            if (!this.checkdblclick()) return;

            var imgContent = $(img).parents(".iscroll_content");
            if (imgContent.length == 0) {
                imgContent = $(img).parents(".image_content");
            }

            var imgs = imgContent.find(".content_image"),
                thissrc = img.attributes["src"].nodeValue,
                asrc = [],
                i,
                src,
                n;

            for (i = 0; i < imgs.length; i++) {
                src = imgs[i].attributes["src"].nodeValue;
                if (src == thissrc) n = i;
                asrc.push(src);
            }

            showimages(n, asrc);
        },

        showAlbumImage: function (srcs, contentId) {
            var that = this;
            if (!srcs || !srcs.length) return;
            if (!bizapp.checkdblclick()) return;

            if (!config.IsMin) {
                showimages(0, srcs, contentId);
                return;
            }

            var ary = [];
            if (isAndroid) {
                for (var i = 0; i < srcs.length; i++) {
                    ary.push(rootPath + srcs[i]);
                }
                showimages(0, ary, contentId);
            } else {
                for (var i = 0; i < srcs.length; i++) {
                    ary.push(config.ResUrlPre + config.AppName + "/" + srcs[i]);
                }
                showimages(0, ary, contentId);
            }

            return;

            //TODO
            var loopCheck = function (index) {
                if (srcs.length == index) {
                    showimages(0, srcs, contentId);
                    return;
                }
                that._checkFileExists(srcs[index], function (bl) {
                    if (!bl) {
                        maopao("加载失败，请检测您的网络～");
                        return;
                    } else {
                        index++;
                        loopCheck(index);
                    }
                })
            }

            if (!navigator.onLine) {
                var i = 0;
                loopCheck(i);
                return;
            }

            this._showHud();

            var that = this;
            this._downLoadFiles(srcs.slice(0), function () {
                that._hideHud();
                showimages(0, srcs, contentId);
            });
        },

        playvideo: function (obj) {
            if (!this.checkdblclick()) return;

            this._showHud();

            var that = this;
            var alt = "http://api.3g.youku.com/layout/phone2_1/play?point=1&id=" + obj.alt
				+ "&pid=352e7f78a0bc479b&format=4&language=guoyu&audiolang=1&guid=c7a0fd9f8f19ea5cbafde16f327f8004&ver=2.3.1&operator=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A_46001&network=WIFI";
            $.ajax({
                url: alt,
                dataType: "jsonp",
                success: function (data) {
                    var url = "";
                    if (!!data && "results" in data && "3gphd" in data.results && data.results["3gphd"].length)
                        url = data["results"]["3gphd"][0]["url"];

                    if (url) {
                        if (isAndroid)
                            playvedio(url);
                        else
                            that._playvideoiphone(url);
                    }
                    else {
                        alert("视频播放失败");
                        that.errorLog("视频播放失败");
                        that._hideHud();
                    }
                },
                error: function () {
                    alert("视频播放失败");
                    that.errorLog("视频播放失败");
                    that._hideHud();
                }
            });
        },

        show360: function (url, contentId) {
            if (!this.checkdblclick()) return;

            var that = this;

            if (!navigator.onLine) {
                that._checkFileExists(url, function (bl) {
                    if (bl) {
                        if (isAndroid) {
                            show360("", url);
                        }
                        else {
                            switch (that.animateStyle) {
                                case allStyle.cover:
                                    that._cover.show360.call(that, url, function () { });
                                    break;
                                case allStyle.slider:
                                    that._slider.show360.call(that, url);
                                    break;
                                default:
                                    break;
                            }
                        }
                    } else {
                        maopao("加载失败，请检测您的网络～");
                    }
                })
                return
            }

            if (!('showLoading' in config) || ('showLoading' in config && config['showLoading'] == true)) {
                if (config.IsMin)
                    that._showHud();
            }



            this._downLoadFilesByContentId(contentId, "html/" + url.match(/\d+/), function (bl) {
                if (isAndroid) {
                    that._hideHud();
                    show360("", url);
                }
                else {
                    switch (that.animateStyle) {
                        case allStyle.cover:
                            that._cover.show360.call(that, url, function () {
                                that._hideHud();
                            });
                            break;
                        case allStyle.slider:
                            that._hideHud();
                            that._slider.show360.call(that, url);
                            break;
                        default:
                            break;
                    }
                }
            });
        },

        hidePadRes: function () {
            if (!this.canHide) return;

            var id = this.pagelist.pop(),
                div = $("#" + id),
                that = this;

            that.canHide = false;

            div.fadeOut(350, function () {
                that.canHide = true;
				var iframe = window.frames['res_frame'];
				if(iframe){
					iframe.document.body.innerHTML='';
					$(iframe).attr('src','about:blank');
				}
            });
        },

        showRes: function (url, contentId) {
            if (!this.checkdblclick()) return;

            var that = this;
            if (!('showLoading' in config) || ('showLoading' in config && config['showLoading'] == true)) {
                that._showHud();
            }

            this._downLoadFilesByContentId(contentId, url, function (bl) {
                if (bl) {
                    if (!('showLoading' in config) || ('showLoading' in config && config['showLoading'] == true)) {
                        that._hideHud();
                    }
                    switch (that.animateStyle) {
                        case allStyle.cover:
                            if (isPad || isPC) that._cover.showRes.call(that, url);
                            else that._cover.show360.call(that, url);
                            break;
                        case allStyle.slider:
                            that._slider.show360.call(that, url);
                            break;
                        default:
                            break;
                    }
                } else {
                    that.hideHud();
                    maopao("加载失败,请检查您的网络~");
                }
            });
        },

        log: function (contentId, index, isShare) {
            if (isPC) return;

            if (index != undefined) {
                contentId = config.TpInfo[contentId].Url[index];
            }
            contentId = /\d+/.exec(contentId);
            if (!("setLogHistory" in window) || !contentId) return;

            setLogHistory(contentId, isShare);
        },

        errorLog: function (msg) {
            var url = "http://a.mo2.cn/api/submitlog?logtype=js&logtext=" + msg
                + "&memo=" + config.AppName + "-" + deviceType;
            $.getJSON(url, function () { });
        },

        showShare: function (relativePath) {
            if (!this.checkdblclick()) return;

            if (isAndroid) this._cover.showShare.call(this, relativePath);
            else {
                switch (this.animateStyle) {
                    case allStyle.cover:
                        this._cover.showShare.call(this, relativePath);
                        break;
                    case allStyle.slider:
                        this._slider.showShare.call(this, relativePath);
                        break;
                    default:
                        break;
                }
            }
        },

        checkdblclick: function () {
            var now = new Date().getTime(), bl = true;
            var interval = 500;

            if (now - this.clicktime < interval) {
                bl = false;
            }

            if (bl) this.clicktime = now;
            return bl;
        },

        slider: function (d) {
            if (!isIos) return;

            var cur = this.pagelist[this.pagelist.length - 1],
                reg = /^(html_(\d+))$/;
            if (reg.test(cur)) {
                if (d == 2) {
                    this.hidepage();
                }
            }
        },

        hideAnimateStart: function () {
            var animate = document.getElementById("iframe_animate");
            animate.style.display = "none";

            this.container.style.visibility = "visible";
        },

        showResBackBtn: function (bl) {
            document.getElementById("res-back-btn").style.display = bl ? "block" : "none";
        },

        _cover: {
            createpage: function (html, tpid) {
                html = unescape(html);

                var div, showtype = config.TpInfo[tpid].ShowType, that = this;
                if (showtype != -1) {
                    div = this._cover.getmovediv.call(this, tpid);
                    document.body.appendChild(div);
                    $(div).html(html);

                    var that = this;
                    this._cover.showanimate.call(this, div, config.TpInfo[tpid].NoTranslate);
                }
                else {
                    div = this.sliderObj;
                    $(div).html(html);
                    this._cover.removeMoveDiv();
                }
                this._fillImage(div);
                var scrollcontent = div.querySelector(".iscroll_content");
                this._newcontentscroll(scrollcontent, config.TpInfo[tpid]);
            },

            getmovediv: function (tpid) {
                var showtype = config.TpInfo[tpid].ShowType,
                    notranslate = config.TpInfo[tpid].NoTranslate,
                    tr = "",
                    duration,
                    isHidden;

                if (!notranslate) {
                    switch (showtype) {
                        case 0:
                            // 从右边进入
                            tr = this.width + "px, 0";
                            break;
                        case 2:
                            // 直接显示
                            tr = "0, 0";
                            duration = 0;
                            break;
                        case 3:
                            // 淡入淡出
                            tr = "0, 0";
                            isHidden = true;
                            break;
                        default:
                            break;
                    }
                }
                else {
                    switch (showtype) {
                        case 0:
                            // 从右边进入
                            tr = "left:" + this.width + "px;top:0;";
                            break;
                        case 2:
                            // 直接显示
                            tr = "left:0;top:0;";
                            duration = 0;
                            break;
                        case 3:
                            // 淡入淡出
                            tr = "left:0;top:0;";
                            isHidden = true;
                            break;
                        default:
                            break;
                    }
                }

                return this._cover.getmovedivhtml.call(this, tpid, tr, notranslate, isHidden, duration);
            },

            getmovedivhtml: function (id, pos, notranslate, isHidden, duration, div) {
                if (!div) div = document.createElement("div");
                div.className = "bizapp_move";
                div.id = id;
                div.style.cssText =
					"background-color:black;" +
                    "top:0;" +
                    (!notranslate ? "" : pos) +
                    "position:absolute;" +
                    "width:" + this.width + "px;" +
                    "height:" + this.height + "px;" +
                    "z-index:10;overflow:hidden;" +
                    "-webkit-transition-duration:" + (duration != undefined ? duration : "350") + "ms;";

                if (isHidden) div.style.cssText += "opacity:0;";
                else div.style.cssText += (!notranslate ? "-webkit-transition-property:-webkit-transform;-webkit-transform:translate(" + pos + ") " + translateZ : "")

                return div;
            },

            removeMoveDiv: function () {
                $(".bizapp_move").remove();
            },

            showanimate: function (div, notranslate, callback) {
                if (callback) {
                    div.addEventListener("webkitTransitionEnd", function () {
                        if (callback) callback();
                        callback = null;
                    });
                }

                var iframe = div.querySelector("iframe"),
                    fn = function () {
                        if (notranslate) {
                            div.style.left = "0";
                            div.style.top = "0";
                        }
                        else {
                            div.style["webkitTransform"] = "translate(0,0) " + translateZ;
                        }
                        if (div.style.opacity == 0) {
                            div.style.opacity = 1;
                        }
                    };
                if (iframe) {
                    iframe.onload = function () {
                        fn();
                    };
                }
                else {
                    setTimeout(function () {
                        fn();
                    });
                }
            },

            createScroll: function (tpid, index) {
                var div = this._cover.getmovediv.call(this, tpid);
                div.style.backgroundColor = "#000";
                document.body.appendChild(div);

                this._getArticleScroll(div, tpid, index);

                this._cover.showanimate.call(this, div);
            },

            createswipeview: function (tpid, index) {
                var div = this._cover.getmovediv.call(this, tpid);
                div.style.backgroundColor = "#000";
                var spdiv = document.createElement("div");
                spdiv.style.height = div.style.height;
                spdiv.style.width = div.style.width;
                div.appendChild(spdiv);
                document.body.appendChild(div);

                var tpconfig = config.TpInfo[tpid];
                var gallery = new SwipeView(spdiv, {
                    numberOfPages: tpconfig.Url.length,
                    loop: false,
                    hastyPageFlip: false,
                    isfollow: true
                });

                var that = this;
                gallery.onFlip(function () {
                    var upcoming, mp;
                    for (i = 0; i < gallery.upcomingIndex.length; i++) {
                        upcoming = gallery.upcomingPageIndex[i];
                        mp = gallery.masterPages[gallery.upcomingIndex[i]];
                        $(mp).html(that._loadpage(tpconfig.Url[upcoming]));

                        that._newcontentscroll(mp.querySelector(".iscroll_content"), tpconfig);
                    }

                    that._fillImage(gallery.masterPages[gallery.masterPagesIndex[1]]);
                });

                var i, page, mp;
                for (i = 0; i < 3; i++) {
                    page = i == 0 ? tpconfig.Url.length - 1 : i - 1;
                    if (!tpconfig.Url[page]) continue;
                    mp = gallery.masterPages[i];
                    $(mp).html(that._loadpage(tpconfig.Url[page]));

                    that._newcontentscroll(mp.querySelector(".iscroll_content"), tpconfig);
                }

                if (index != 0) gallery.goToPage(index);
                else this._fillImage(gallery.masterPages[gallery.masterPagesIndex[1]]);

                this._cover.showanimate.call(this, div);
            },

            hidepage: function () {
                var tpid = this.pagelist[this.pagelist.length - 1],
                    hidetype,
                    notranslate;

                if (!config.TpInfo[tpid]) {
                    hidetype = config.AnimateStyle;
                    notranslate = true;
                }
                else {
                    hidetype = config.TpInfo[tpid].HideType;
                    notranslate = config.TpInfo[tpid].NoTranslate;
                }

                if (hidetype == -1) {
                    if (isAndroid) demo.exitapp();
                    return;
                }

                if (!this.canHide) return;
                this.canHide = false;
                this.pagelist.pop();

                var div = document.getElementById(tpid),
                    that = this,
                    fn = function () { that._removepage(div); that.canHide = true; },
                    time = 350,
				    pos;

                var iframe = div.querySelector("iframe");
                div.addEventListener("webkitTransitionEnd", fn);
                if (notranslate) {
                    switch (hidetype) {
                        case 0:
                            div.style.left = this.width + "px";
                            div.style.top = "0";
                            break;
                        case 2:
                            fn();
                            break;
                        case 3:
                            div.style.opacity = 0;
                            break;
                        default:
                            break;
                    }
                } else {
                    switch (hidetype) {
                        case 0:
                            pos = this.width + "px,0";
                            break;
                        case 2:
                            fn();
                            break;
                        case 3:
                            div.style.opacity = 0;
                            break;
                        default:
                            break;
                    }
                    if (pos) div.style["webkitTransform"] = "translate(" + pos + ") " + translateZ;
                }
                //event.stopPropagation();
                if (event) {
                    event.preventDefault();
                }
				
            },

            showShare: function (relativePath) {
                var id = "divShare", that = this;
                this.pagelist.push(id);

                var div = this._cover.getmovedivhtml.call(this, id, "top:0;left:" + this.width + "px;", true);
                document.body.appendChild(div);

                div.innerHTML = '<iframe src="' + relativePath + '" frameborder="0" width="100%" height="100%" style="position:absolute;top:0;left:0;z-index:10;"></iframe>';
                this._cover.showanimate.call(this, div, true, function () {
                    that.container.style.display = "none";
                });
            },

            show360: function (url, callback) {
                var id = "div360",
                    duration,
                    isHidden,
                    tr;

                switch (config.AnimateStyle) {
                    case 0:
                        // 从右边进入
                        tr = "left:" + this.width + "px;top:0;";
                        break;
                    case 2:
                        // 直接显示
                        tr = "left:0;top:0;";
                        duration = 0;
                        break;
                    case 3:
                        // 淡入淡出
                        tr = "left:0;top:0;";
                        isHidden = true;
                        break;
                    default:
                        break;
                }

                this.pagelist.push(id);

                var div = this._cover.getmovedivhtml.call(this, id, tr, true, isHidden, duration);
                document.body.appendChild(div);
                div.innerHTML = '<a href="#" onclick="if(!(\'ontouchstart\' in window)){ bizapp.hidepage();}" ontouchstart="bizapp.hidepage();" id="res-back-btn" class="back-btn" style="position:absolute;z-index:20;"></a> '
                        + '<iframe name="res_frame" src="' + url + '" frameborder="0" width="100%" height="100%" style="position:absolute;top:0;left:0;z-index:10;"></iframe>';

                this._cover.showanimate.call(this, div, true, callback);
            },

            showRes: function (url) {
                var id = "divRes";
                var div = document.getElementById(id);
                this.pagelist.push(id);
                if (!div) {
                    var size = this._getSnapSize(1024, 748);
                    div = document.createElement("div");
                    div.id = id;
                    div.className = "bizapp_move";
                    div.style.cssText = "background-color:black;position:absolute;left:0;top:0;z-index:11;display:none;width:100%;height:100%;";
                    div.innerHTML = '<a href="#" onclick="bizapp.hidePadRes()" ontouchstart="bizapp.hidePadRes()" id="res-back-btn" class="back-btn" style="position:absolute;z-index:20;"></a> '
                        + '<iframe name="res_frame" src="about:blank" frameborder="0" width="1024" height="748" style="-webkit-transform-origin: 0 0;-webkit-transform:scale(' + (size.w / 1024) + ');position:absolute;top:0;left:' + ((this.width - size.w) / 2) + 'px;z-index:10;"></iframe>';
                    document.body.appendChild(div);
                }

                var iframe = div.querySelector("iframe");
                iframe.src = url;
                iframe.onload = function () {
                    $(this.parentNode).show();
                }
            }
        },

        _slider: {
            createpage: function (html, tpid) {
                var tpconfig = config.TpInfo[tpid],
                    div;

                if (tpconfig.ShowType == -1) {
                    div = this.sliderObj;
                    $(this.sliderObj).html("<div id='" + tpid + "' class='scroll_page' style='float:left;width:" + this.width + "px;'>" + html + "</div>");
                    this.sliderObj.width = this.width + "px";
                    this.scroll.refresh();
                    this.scroll.scrollToPage(0, 0, 0);
                }
                else {
                    div = this._slider.addscrollpage.call(this, html, tpid);
                }

                this._newcontentscroll(div.querySelector(".iscroll_content"), tpconfig);
                this._fillImage(div);
            },

            addscrollpage: function (html, tpid) {
                var div = this._slider.getPageObj.call(this, tpid);
                this.sliderObj.appendChild(div);
                $(div).html(html);

                this._slider.animate.call(this);
                return div;
            },

            createScroll: function (tpid, index) {
                var div = this._slider.getPageObj.call(this, tpid);
                this.sliderObj.appendChild(div);
                this._getArticleScroll(div, tpid, index);

                this._slider.animate.call(this);
            },

            getPageObj: function (id) {
                var div = document.createElement("div");
                div.id = id;
                div.className = "scroll_page";
                div.style.cssText = "float:left;width:" + this.width + "px;";
                return div;
            },

            showShare: function (relativePath) {
                var div = this._slider.getPageObj.call(this, "divShare");
                div.innerHTML = '<iframe src="' + relativePath + '" frameborder="0" width="' + this.width
                    + '" height="' + this.height + '"></iframe>';
                this.sliderObj.appendChild(div);

                this._slider.animate.call(this);
            },

            animate: function () {
                var curCount = this.sliderObj.querySelectorAll(".scroll_page").length;
                this.sliderObj.style.width = (curCount * this.width) + "px";
                this.scroll.refresh();
                this.scroll.scrollToPage(curCount - 1, 0, 350);
            },

            hidepage: function () {
                if (!this.scroll) return;

                var index = this.scroll.currPageX;
                if (index == 0 && isAndroid) {
                    demo.exitapp();
                    return;
                }

                this.scroll.scrollToPage(index - 1, 0, 350);
                this.isRemove = true;
            },

            show360: function (url) {
                this._slider.addscrollpage.call(this, '<div style="position:relative;"><a href="javascript:if(!(\'ontouchstart\' in window)) bizapp.hidepage();" ontouchstart="bizapp.hidepage();" class="back-btn" style="position:absolute;top:0;left:0;z-index:20;"></a>'
                    + '<iframe src="' + url + '" frameborder="0" width="100%" height="100%" style="position:relative;z-index:10;"></iframe></div>', "");
            }
        },

        _getSnapSize: function (iw, ih) {
            var ww = this.width,
				wh = this.height,
				w, h;
            if (iw / ih > ww / wh) {
                w = ww;
                h = w * ih / iw;

            } else {
                h = wh;
                w = h * iw / ih;
            }

            return { w: w, h: h };
        },

        _fillImage: function (div) {
            //if (!config.IsMin) return;
			this._fillCommonImage(div); // 用来替换图片的，通用格式
			
            var key = "isinit_image";
            if (div.getAttribute(key)) return;

            var imageDivArr = div.querySelectorAll(".content_image_outer"),
                len = imageDivArr.length,
                that = this,
                parent,
                i;

            if (!len) return;

            var itemDown = function (index) {
                var div = imageDivArr[index];

                var parent = div.parentNode;
                var width = parent.offsetWidth - parseFloat(parent.style.paddingLeft || "0") - parseFloat(parent.style.paddingRight || "0");

                var pro = parseFloat(div.attributes["pro"].nodeValue);
                var height = width / pro;

                div.style.width = width + "px";
                div.style.height = height + "px";

                var img = div.querySelector("img");
                img.style.display = "inline";
                var src = img.alt;

                var setimg = function (src) {
                    img.src = src;
                    img.style.width = width + "px";
                    img.className = "content_image";
                    img.addEventListener("click", function () {
                        that.showimages(this);
                    });
                };

                var setErrorImg = function (src) {
                    // img.src = src;
                    // img.style.width = width + "px";
                    // img.className = "content_image";
                    // img.addEventListener("click", function () {
                    //     that.showimages(this);
                    // });
                }

                if (isPC) {
                    img.src = src;
                    setimg();
                }
                else {
                    that._checkFileExists(src, function (bl) {
                        if (bl) {
                            setimg(src);
                        }
                        else {
                            if (!navigator.onLine) {
                                setErrorImg(src);
                                return;
                            }
                            that._downLoadFile(src, function (bl) {
                                if (bl) {
                                    setimg(src);
                                }
                            });
                        }
                    });
                }
            }

            for (i = 0; i < len; i++) {
                itemDown(i);
            }
            div.setAttribute(key, 1);
        },
		
		_fillCommonImage: function (div) {
			var key = "isinit_imagetag";
            if (div.getAttribute(key)) return;
			
            var imageArr = div.querySelectorAll(".image_tag"),
                len = imageArr.length,
                that = this,
                i;

            if (!len) return;

            var itemDown = function (index) {
                var img = imageArr[index];

                var sourceSrc = img.attributes["sourceSrc"].nodeValue;
				var targetSrc = img.attributes["targetSrc"].nodeValue;
				var needServerUrl = img.attributes["needServerUrl"];
				
				if(needServerUrl != undefined){
					sourceSrc = config.ServerUrl + sourceSrc;
				}
				
                var setimg = function (src) {
                    img.src = src; 
					img.className = "content_image";
                    img.addEventListener("click", function () {
                        that.showimages(this);
                    });
					img.style.opacity = 0.9;
					setTimeout(function(){
						img.style.opacity = 1;
					},600);
                };

                var setErrorImg = function (src) {
                }

                if (isPC) {
                    img.src = sourceSrc;
                    setimg(sourceSrc + '&deviceAppId=1');
                }
                else {
                    that._checkFileExists(targetSrc, function (bl) {
                        if (bl) {
                            setimg(targetSrc);
                        }
                        else {
                            if (!navigator.onLine) {
                                setErrorImg('images/upload.jpg');
                                return;
                            }
                            that._downLoadQrCodeFile(sourceSrc, targetSrc, function (bl, tempUrl) {
                                if (bl) {
                                    setimg(targetSrc);
                                }else if(tempUrl){
									setimg(tempUrl);
								}else{
									setimg('images/upload.jpg');
								}
                            });
                        }
                    });
                }
            }

            for (i = 0; i < len; i++) {
                itemDown(i);
            }
            div.setAttribute(key, 1);
        },

        _getArticleScroll: function (container, tpid, index) {
            var urls = config.TpInfo[tpid].Url;

            var content = document.createElement("div");
            content.style.cssText = "height:" + this.height + "px;width:" + this.width
                + "px;position:absolute;overflow:hidden;";

            var slider = document.createElement("div");
            slider.style.cssText = "width:" + (this.width * urls.length) + "px;height:" + this.height + "px;";
            content.appendChild(slider);

            var html = "", i;
            for (i = 0; i < urls.length; i++) {
                html += "<div style='height:" + this.height + "px;width:" + this.width + "px; float:left;'>";
                html += this._loadpage(urls[i]);
                html += "</div>";
            }
            container.appendChild(content);
            $(slider).html(html);

            var that = this;
            var scroll = new iScroll(content, {
                snap: true, momentum: false, useTransition: true, hScrollbar: false, snapThreshold: 100,
                onScrollEnd: function () {
                    var index = this.currPageX;
                    if (!this.isNewContentScroll[index]) {
                        var content = $(this.scroller).find("> div").eq(index).find(".iscroll_content").get(0);
                        that._newcontentscroll(content, config.TpInfo[tpid]);
                        this.isNewContentScroll[index] = true;

                        that._fillImage(content);
                    }
                }
            });

            scroll.isNewContentScroll = [];

            if (index) scroll.scrollToPage(index, 0, 0);
            else {
                var firstContent = $(scroll.scroller).find("> div").eq(0).find(".iscroll_content").get(0);
                that._newcontentscroll(firstContent, config.TpInfo[tpid]);
                scroll.isNewContentScroll[0] = true;

                this._fillImage(firstContent);
            }
        },

        _showHud: function () {
            if ("showHud" in window) showHud("");
        },

        _hideHud: function () {
            if ("hideHud" in window) hideHud();
        },

        _showdefaultpage: function () {
            this.showpage(config.DefaultTp);
            this.clicktime = 0;
        },

        _showheadpage: function () {
            if (!config.HeadPage || config.HeadPage.length == 0) {
                this.container.style.visibility = "visible";
                return;
            }

            var hp = document.createElement("div");
            hp.style.cssText = "-webkit-transition-duration:500ms;position:absolute;top:0;left:0;overflow:hidden;width:" + this.width + "px;height:"
                + this.height + "px;background-color:black;display: -webkit-box;-webkit-box-orient: horizontal;-webkit-box-pack: center;-webkit-box-align: center;";
            document.body.appendChild(hp);

            var len = config.HeadPage.length,
                that = this,
                i;

            var html = "<div style='width:" + (this.width * len) + "px;'>";
            for (i = 0; i < len; i++) {
                html += "<img style='-webkit-transform:translate3d(0,0,0);' width='" + this.width + "px' src='" + config.HeadPage[i] + "' />";
            }
            html += "</div>";
            hp.innerHTML = html;

            if (config.SkipButton) {
                var skip = document.createElement("img");
                skip.src = config.SkipButton;
                skip.width = config.skipButtonWidth;
                skip.style.cssText = "position:absolute;bottom:10px;right:10px;-webkit-transform:translate3d(0,0,0)";
                skip.addEventListener("click", function () {
                    that._removeheadpage(hp,that);

                });
                hp.appendChild(skip);
            }

            var indexdiv = this._createindex(hp);
            new iScroll(hp, {
                hScrollbar: false, momentum: false, snap: true, useTransition: true, vScroll: false,
                onScrollEnd: function () {
                    that._changeindex(indexdiv, this.currPageX);
					if(this.currPageX == (len-1)){
						that._iscrollremovehp(hp,that);				
					}
                }
            });
        },
		
		_removeheadpage : function (hp,that){
			that.container.style.visibility = "visible";
			setTimeout(function () {
				hp.addEventListener("webkitTransitionEnd", function () {
					$(hp).remove();
				});
				hp.style.opacity = 0;
				hp.style.webkitTransform = "scale(2)";
			});	
		},
		
		_iscrollremovehp: function(hp,that){
			var startX,endX;
			var moveX = 0;
			hp.addEventListener('touchstart', function(e){
				var pos1 = e.changedTouches[0];
				 startX = pos1.pageX; 
				hp.addEventListener('touchend',function(e){
					var pos1 = e.changedTouches[0];
					 endX = pos1.pageX; 
					 moveX = startX - endX;
					if(moveX>50){
						that._removeheadpage(hp,that);
					}
				});
			});	
		},

        _createindex: function (hp) {
            var i, len = config.HeadPage.length,
                indexdiv = document.createElement("div"),
                subdiv,
                w = 6;
            if (config.roundDotSize)
                w = config.roundDotSize;

            var top = this.height - w * 2;
            if (config.roundDotPosition)
                top = config.roundDotPosition;

            var roundDotCurrentColor = '#656565';
            if (config.roundDotCurrentColor)
                roundDotCurrentColor = config.roundDotCurrentColor;

            var roundDotColor = '#cccccc';
            if (config.roundDotColor)
                roundDotColor = config.roundDotColor;


            indexdiv.style.cssText = "left:" + ((this.width - (len * 2 - 1) * w) / 2)
                + "px;text-align:center;position:absolute;top:" + top + ";";
            for (i = 0; i < len; i++) {
                subdiv = document.createElement("div");
                subdiv.style.cssText = "width:" + w + "px;float:left; margin-left:6px;height:" + w
                    + "px;-webkit-border-radius: " + (w / 2) + "px;background-color:" + roundDotColor + ";";

                if (i == 0) subdiv.style.backgroundColor = roundDotCurrentColor;
                indexdiv.appendChild(subdiv);
            }

            hp.appendChild(indexdiv);

            return indexdiv;
        },

        _changeindex: function (indexdiv, index) {
            var divs = indexdiv.querySelectorAll("div"),
                i;

            var roundDotCurrentColor = '#656565';
            if (config.roundDotCurrentColor)
                roundDotCurrentColor = config.roundDotCurrentColor;

            var roundDotColor = '#cccccc';
            if (config.roundDotColor)
                roundDotColor = config.roundDotColor;

            for (i = 0; i < divs.length; i++) {
                if (i == index) divs[i].style.backgroundColor = roundDotCurrentColor;
                else divs[i].style.backgroundColor = roundDotColor;
            }
        },

        _playvideoiphone: function (src) {
            var curpage = document.getElementById(this.pagelist[this.pagelist.length - 1]),
                video = curpage.querySelector("video"),
                that = this;
            if (video && video.src != src) {
                $(video).remove();
                video = null;
            }
            if (video == null) {
                video = document.createElement("video");
                video.src = src;
                video.controls = "controls";
                var left;
                if (isPC) left = 0;
                else left = this.width;
                video.style.cssText = "width:" + this.width + "px;height:" + this.height
                    + "px;position:absolute;left:" + left + "px;top:0";
                curpage.appendChild(video);
                video.addEventListener("playing", function () {
                    that._hideHud();
                    this.webkitEnterFullscreen();
                });
                video.addEventListener("webkitendfullscreen", function () {
                    this.pause();
                });
            }
            video.play();
        },

        _playVideoWinPad: function (src) {
            var div = document.createElement("div");
            div.id = "divVideoWinPad";
            div.style.cssText = "width:" + this.width + "px;height:" + this.height
				+ "px;position:absolute;left:0px;top:0;background-color:#000;z-index:1000;";

            var video = document.createElement("video");
            video.src = src;
            video.controls = "controls";
            video.autoplay = "autoplay";
            video.style.cssText = "width:" + this.width + "px;height:" + this.height
				+ "px;position:absolute;left:0px;top:0";
            div.appendChild(video);

            var that = this;
            var back = document.createElement("div");
            back.addEventListener("click", function () {
                that.pagelist.pop();
                document.body.removeChild(this.parentNode);
            }, false);
            back.style.cssText = "width:100px; height:100px;background:url(images/back_larrow.png) center center no-repeat;position:absolute;top:0;left:0;";
            div.appendChild(back);

            document.body.appendChild(div);
            this.pagelist.push(div.id);
        },

        _newcontentscroll: function (content, tpconfig) {
            if (!content) return;
            content.style.overflow = "hidden";
            content.style.position = "relative";
            content.style.height = this._getbodysize(tpconfig.ShowType) + "px";
            if (tpconfig.NoScroll) return;

            var options = {
                hScrollbar: false, vScrollbar: false, hScroll: false, hideScrollbar: true,
                useTransition: true, bounce: !tpconfig.NoScrollBounce,
                onScrollStart: function () {
                    this.refresh();
                }
            };
            new iScroll(content, options);
        },

        _getbodysize: function (showtype) {
            var hheight = config.Size.HeaderHeight,
                fheight = config.Size.FooterHeight,
                height = this.height;

            if (hheight) height -= hheight;
            if (fheight && showtype == -1) height -= fheight;
            return height;
        },

        _removepage: function (div) {
            $(div).remove();
        },

        _loadpage: function (url) {
            return $.ajax({
                async: false,
				cache: false,
                url: url,
                dataType: "text"
            }).responseText;

            //ttp://a.mo2.cn/res/" + config.AppName + "/";
            /* var xhr = new XMLHttpRequest();
            xhr.open("GET",url,false);
            xhr.send(null);
            var result = xhr.status;  
            if(result == 200){  
            return xhr.responseText;
            }else{
            return 'undefined';
            }
            xhr=null;  
            */


        },

        _checkFileExists: function (filePath, callback) {
            if (isPC) {
                callback(true, filePath);
                return;
            }

            var path = rootPath + filePath;
            var entry = new FileEntry("contentImage", path);
            entry.getMetadata(function () {
                if (callback) callback(true, filePath);
            }, function () {
                if (callback) callback(false, filePath);
            });
        },
		
		 _downLoadQrCodeFile: function (filePath, targetUrl, callback) {
            if (!this.fileTransfer) {
                callback(true);
                return;
            }
			var that = this;
			getAppDeviceId(function(appDeviceId) {
				if(typeof appDeviceId == 'object'){
					that.fileTransfer.download(filePath + '&deviceAppId=0', rootPath + 'qrcode/temp.png', function () {
						if (callback) callback(false, 'qrcode/temp.png');
					}, function (error) {
						if (callback) callback(false, 'qrcode/temp.png');
					});
					return;
				}
				
				var downPath = filePath + '&deviceAppId='+appDeviceId;
				
				that.fileTransfer.download(downPath, rootPath + targetUrl, function () {
					if (callback) callback(true);
				}, function (error) {
					if (callback) callback(false);
				});
			});
        },

        _downLoadFile: function (filePath, callback) {
            if (!this.fileTransfer) {
                callback(true);
                return;
            }

            this.fileTransfer.download(config.ResUrlPre + config.AppName + "/" + filePath, rootPath + filePath, function () {
                if (callback) callback(true);
            }, function (error) {
                if (callback) callback(false);
            });
        },

        _downLoadFiles: function (filePaths,fileCount, callback) {
            if (!filePaths.length) {
				if(typeof fileCount == 'function')fileCount();
                if (callback) callback();
                return;
            }
			if(fileCount && typeof fileCount == 'function'){
				callback = fileCount;
			}
            var that = this, path = filePaths.pop();
            this._checkFileExists(path, function (bl, src) {
                if (!bl){
					var index = fileCount-filePaths.length;
					if('setHudText' in window)setHudText("下载中..."+index+"/"+fileCount);
					that._downLoadFile(src, function () {
						that._downLoadFiles(filePaths,fileCount, callback);
					});
				}
                else that._downLoadFiles(filePaths,fileCount, callback);
            });
        },

        _downLoadFilesByContentId: function (contentId, url, callback) {
            if (!config.IsMin) {
                callback(true);
                return;
            }
            if (!navigator.onLine) {
                callback(false);
            }
            var that = this;
            if ("listSourceByContentId" in window) {
                listSourceByContentId(contentId, function (fileList) {
					var fileCount = fileList.length;
                    that._downLoadFiles(fileList,fileCount, callback);
                });
            }
            else callback(true);
        },

        _showAnimateStart: function () {
            var size = this._getSnapSize(1024, 748);

            var div = document.createElement("div");
            div.style.cssText = "width:" + this.width + "px;height:" + this.height + "px;background-color:black;position:absolute;top:0;left:0;z-index:9999;";
            div.id = "iframe_animate";

            var iframe = document.createElement("iframe");
            iframe.src = config.HasAnimate + "/index.html";
            iframe.width = "1024";
            iframe.height = "748";
            iframe.style.cssText = "-webkit-transform-origin: 0 0;-webkit-transform:scale(" + (size.w / 1024) + ");border:0;position:absolute;top:0;left:" + ((this.width - size.w) / 2) + "px;";
            div.appendChild(iframe);

            document.body.appendChild(div);
        }
    };

    return _bizapp;
})();