var metro = (function () {
    var _metro = function (el, options) {
        this._point = [];
        this.container = typeof el == 'string' ? document.querySelector(el) : el;
        this.container.style.display = "block";
        this.width = this.container.offsetWidth;

        this.options = {
            columns: 0,
            ismetro: false,
            titlesize: 12,
            titlecss: "",
            metroinfo: [],
            spacing: 8,
            event: {}
        };

        var i;
        for (i in options) this.options[i] = options[i];

        this.prewidth = (this.width - this.options.spacing) / this.options.columns;

        this.container.innerHTML = this._getMetroHtml(this.options.metroinfo);
        this.container.style.cssText += "width:" + (this.width - this.options.spacing)
            + "px;position:relative;color:white;font-size:" + this.options.titlesize + "px;"
            + "left:" + (this.options.spacing / 2) + "px;" + this.options.titlecss;
        this._refreshsize();
        this._bindevent();
    }

    _metro.prototype = {
        /* public */
        height: 0,

        append: function (mlist) {
            if (mlist.length == 0) return;

            if (!this.options.ismetro)
                this.container.innerHTML = this.container.innerHTML.replace(this._getendtarget(), "");

            this.container.innerHTML += this._getMetroHtml(mlist);

            if (!this.options.ismetro)
                this.container.innerHTML += this._getendtarget();

            this._refreshsize();

            var i;
            for (i = 0; i < mlist.length; i++) {
                this.options.metroinfo.push(mlist[i]);
            }
        },

        preappend: function (mlist) {
            if (mlist.length == 0) return;

            var j;
            for (j = 0; j < this.options.metroinfo.length; j++) {
                mlist.push(this.options.metroinfo[j]);
            }

            this._point = [];
            this.height = 0;
            this.container.innerHTML = this._getMetroHtml(mlist);
            this._refreshsize();
            this.options.metroinfo = mlist;
        },

        /* private */
        _bindevent: function () {
            if (!this.options.event) return;
            var mp = this.container.querySelectorAll("div.metro-page"),
				that = this,
				i,
				j;

            for (i = 0; i < mp.length; i++) {
                for (j in this.options.event) {
                    if (!this.options.event[j]) continue;
                    mp[i].addEventListener(j, function (e) {
                        var index = parseFloat(this.attributes["data-index"].nodeValue);
                        that.options.event[e.type](that.options.metroinfo[index].data, index, e);
                    }, false);
                }
            }
        },

        _refreshsize: function () {
            if (this.height) this.container.style.height = this.height + "px";
        },

        _getMetroHtml: function (mlist) {
            if (mlist.length == 0) return "";

            var html = "",
				sizestr,
				width,
				height,
				pos,
				des = this.options.spacing,
				i,
				m,
				that = this;
				
			// 这里是一个计算单位像素的公式。
			var preWidths = [];
			var getPreWidth = function(index, mmlist){
				if(preWidths.length > index){
					return preWidths[index];
				}
				
				var total = 0;
				var size = 0;
				for(var j = index; j < mmlist.length; j++){
					var mm = mmlist[j];
					if (typeof mm.size == "string") {
						sizestr = mm.size.split("x");
						mm.size = { w: sizestr[0], h: sizestr[1] };
					}
					total = total + parseInt(mm.size.w);
					size++;
					if(total == that.options.columns)
						break;
				}
				for(var j = 0; j < size; j++){
					preWidths[index + j] = (that.width - that.options.spacing - size * that.options.spacing)/that.options.columns;
				}
				
				return preWidths[index];
			}
			
            for (i = 0; i < mlist.length; i++) {
				// 如果是短信分享，并且是ios设备
                m = mlist[i];
				
				if(!m.show){
					continue;
				}
				
                if (typeof m.size == "string") {
                    sizestr = m.size.split("x");
                    m.size = { w: sizestr[0], h: sizestr[1] };
                }

				if('MetroType' in appInfo && appInfo['MetroType'] == 2 && !this.options.ismetro){
					try{
						var prewidth = getPreWidth(i, mlist);
						// 磁贴外框的宽度
						width = m.size.w * prewidth + this.options.spacing;
						// 磁贴外框的高度
						height = m.size.h * prewidth + this.options.spacing;
					}catch(ex){
						alert(ex);
						width = m.size.w * this.prewidth;
						height = Math.ceil(m.size.h * this.prewidth);
					}
				}else{
					width = m.size.w * this.prewidth;
					height = Math.ceil(m.size.h * this.prewidth);
				}
				
				var htmlHref = m.data.aTagHref;
				
				if(m.data.type == 'ActionGPS'){
					var lat_lon = m.data.data.lat + ',' + m.data.data.lon;
					if (deviceInfo.isAndroid || deviceInfo.iosVersion < 6) {
						htmlHref = "http://api.map.baidu.com/marker?location=" + lat_lon + "&title=本案&content=本案&output=html";
					}else if(deviceInfo.ios){
						htmlHref = "http://maps.apple.com/?daddr=" + lat_lon;
					}else{
						htmlHref = "http://api.map.baidu.com/marker?location=" + lat_lon + "&title=本案&content=本案&output=html";
					}
				}
				
				if(m.data.type == 'ActionWB'){
					var shareContent = m.data.data.replace('{url}','');
					htmlHref = "http://service.weibo.com/share/share.php?searchPic=false&content=gb2312&title="+shareContent;
				}
				
				if(m.data.type == 'Plugin'){
					htmlHref = htmlHref.replace('{openid}', request.QueryString('openid'));
				}
				
				if(htmlHref != ''){
					if(htmlHref.indexOf('?') >=0){
						htmlHref = htmlHref + '&' + getParams();
					}else{
						htmlHref = htmlHref + '?' + getParams();
					}
				}
				
				var ele = htmlHref == '' ? 'div' : 'a';
				if(htmlHref.indexOf('#mp.weixin.qq.com') < 0)
					htmlHref += '#mp.weixin.qq.com'
				
                html += "<" + ele + (ele=='a'? " href=\"" + htmlHref + "\" ":"") + this._getData(m) + " data-index='" + i
					+ "' class='metro-page' style='width:"
                    + width + "px;height:" + height + "px; padding-left:5px; padding-right:5px;";

                if (this.options.ismetro) {
                    pos = this._getPostion(m.size);
                    html += "position:absolute;left:" + pos.left + "px;top:" + pos.top + "px;";
                }
                else html += "float:left;";

                html += "'><div style='margin:" + (des / 2) + "px;width:"
				    + (width - des) + "px;height:" + (height - des) + "px;" +
					"display:-webkit-box;-webkit-box-orient: horizontal;-webkit-box-pack: center;-webkit-box-align: center;";
                html += this._getStyle(m);
                html += "' >";
                html += this._getBackimg(m);
                html += this._getIcon(m);
                html += "</div>";
                html += this._getTitle(m);
                html += "</" + ele + ">";
            }

            if (!this.options.ismetro) html += this._getendtarget();
            return html;
        },

        _getendtarget: function () {
            return "<div class='metro_end' style='clear:both;'></div>";
        },

        _getData: function (m) {
			return "";
            // if (!m.data) return "";

            // var i, html = "";
            // for (i in m.data) {
                // html += " data-" + i + "=" + m.data[i] + " ";
            // }
            // return html;
        },

        _getPostion: function (size) {
            var w = size.w * this.prewidth,
				h = size.h * this.prewidth;
            if (!this._point || this._point.length == 0) {
                this._point.push([0, 0, w, h]);
                return { left: 0, top: 0 };
            }

            var left = 0,
				top = 0,
				iscover,
				islast,
				i,
				p;

            while (true) {
                iscover = false;
                for (i = 0; i < this._point.length; i++) {
                    p = this._point[i];
                    if (left >= p[0] && top >= p[1] && left < p[2] && top < p[3]) {
                        iscover = true;
                    }
                }

                if (iscover) {
                    left += this.prewidth;
                    if (left >= this.width || left + w > this.width) {
                        left = 0;
                        top += this.prewidth;
                    }
                }
                else break;
            }

            this._point.push([left, top, w + left, h + top]);

            if (h + top > this.height) this.height = h + top;

            return { left: left, top: top };
        },

        _getStyle: function (m) {
            var style = "";
            if (m.backcolor) style += "background-color:" + m.backcolor + ";";
            if (m.backimg) style += "background-image:url(" + m.backimg + ");background-size:100% 100%;background-repeat:no-repeat;";
            return style;
        },

        _getBackimg: function (m) {
            var img = "";
            //if (m.backimg) img = "<img src='" + m.backimg + "' style='width:100%;height:100%;position:absolute;top:0;left:0;' />";

            return img;
        },

        _getIcon: function (m) {
            if (!m.icon) return "";
            return "<img src='" + m.icon + "' />";
        },

        _getTitle: function (m) {
            if (!m.title) return "";

            var h = m.size.h * this.prewidth,
				des = 10 + this.options.spacing / 2;
            return "<div style='display:inline-block;position:relative;left:" + des + "px;top:-" + (this.options.titlesize + des) + "px;'>"
                + m.title + "</div>";
        }
    };

    return _metro;
})();