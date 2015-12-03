var Action = (function(){

	var iosVersion = (function(){
			var v = navigator.userAgent.match(/.*?iPhone\s+OS\s+(\d)[_]\d([_]\d)?\s+like/);
			if (v && v.length == 3) {
				return v[1] * 1;
			}
			else {
				return -1;
			}
		})(),
		isIos = !!navigator.userAgent.match(/(i[^;]+\;(U;)? CPU.+Mac OS X)/),
		isAndroid = (function () {
            var ua = navigator.userAgent,
            _isAndroid = ua.indexOf('Android') > -1 || ua.indexOf('Linux') > -1;

            return _isAndroid;
        })(),
		bodyWidth = document.documentElement.clientWidth,
		bodyHeight = document.documentElement.clientHeight;
		
	var action = function(){};
	
	action.prototype = {
		// 朋友圈
		pyqShare: function(){
			WeixinJSBridge.invoke('shareTimeline', {
				"img_url": 'http://mmsns.qpic.cn/mmsns/A8bicE9Fgy6Cfur6lpNbniaLEBePQxW2cA31aTBpJmnCib4vAHsX7eHlQ/0',
				"img_width": "640",
				"img_height": "640",
				"link": 'http://mp.weixin.qq.com/mp/appmsg/show?__biz=MjM5OTA5MDg2MQ%3D%3D&appmsgid=10000001&itemidx=1#wechat_redirect',
				"desc": '泉:山上有个庙',
				"title": '泉:12345,上山打老虎'
			},
			function(res) {alert('不能分享:'+res.err_msg);});
		},
		
		// 微信分享
		weixinShare: function(){
			//alert('wx: '+WeixinJSBridge);
			//alert(WeixinJSBridge.invoke);
			
			WeixinJSBridge.invoke('sendAppMessage', {
				"img_url": 'http://mmsns.qpic.cn/mmsns/A8bicE9Fgy6Cfur6lpNbniaLEBePQxW2cA31aTBpJmnCib4vAHsX7eHlQ/0',
				"link": 'http://mp.weixin.qq.com/mp/appmsg/show?__biz=MjM5OTA5MDg2MQ%3D%3D&appmsgid=10000001&itemidx=1#wechat_redirect',
				"desc": '泉:山上有个庙',
				"title": '泉:12345,上山打老虎'
			});
			
			WeixinJSBridge.invoke('sendAppMessage', {
				"appid": 'wx81bbeb14f121623f',
				"img_url": 'http://mmsns.qpic.cn/mmsns/A8bicE9Fgy6Cfur6lpNbniaLEBePQxW2cA31aTBpJmnCib4vAHsX7eHlQ/0',
				"img_width": "640",
				"img_height": "640",
				"link": 'http://mp.weixin.qq.com/mp/appmsg/show?__biz=MjM5OTA5MDg2MQ%3D%3D&appmsgid=10000001&itemidx=1#wechat_redirect',
				"desc": '泉:山上有个庙',
				"title": '泉:12345,上山打老虎'
			},
			function(res) {alert('不能分享:'+res.err_msg);});
			//alert(1);
		},
		
		// 微博分享
		sinaShare: function(content){
			location.href = "http://service.weibo.com/share/share.php?searchPic=false&content=gb2312&title="+content;
		},
		
		// 显示地图
		showMap: function(q){
			if (isAndroid || iosVersion < 6) {
				this.redirect("http://maps.google.com/maps?daddr="+q+"&dirfl=d");
			}
			else if (isIos) {
				this.redirect("http://maps.apple.com/?daddr=" + q);
			}
		},
		
		// 显示图片
		showImages: function(n, urls){
			if(WeixinJSBridge){
				
				WeixinJSBridge.invoke('imagePreview', {
					'urls': urls,
					'current': urls[n]
				  });
			}
		},
		
		callPhone: function(tel){
			this.redirect("tel:" + tel);
		},
		
		sendMsg: function(msg) {
			if (isAndroid) {
				this.redirect("sms://?body=" + msg);
			}
			else if (isIos) {
				//TODO
			}
		},
		
		showVideo: function(videoId){
			if (isIos) {
				this._showVideoIos(videoId);
			}
			else if (isAndroid) {
				var flashckh = flashChecker();
				if (flashckh.f) {
					this.redirect("http://player.youku.com/embed/" + videoId);
				}
				else {
					alert("您的设备不支持flash");
				}
			}
		},
		
		show360: function(html, swf){
			if (isIos) {
				this.redirect(html);
			}
			else if (isAndroid) {
				if (ggHasHtml5Css3D() || ggHasWebGL()) {
					this.redirect(html);
				} else if (fls.f && fls.v > 9) {
					this.redirect(swf);
				} else {
					alert("不支持全景");
				}
			}else{
				this.redirect(html);
			}
		},
		
		redirect: function(url){
			location.href = url;
		},
		
		_showVideoAndroid: function(videoId) {
			this.redirect("http://player.youku.com/embed/" + videoId);
		},
		
		_showVideoIos: function(videoId){
			var that = this;
			var src = "http://api.3g.youku.com/layout/phone2_1/play?point=1&id=" + videoId
				+ "&pid=352e7f78a0bc479b&format=4&language=guoyu&audiolang=1&guid=c7a0fd9f8f19ea5cbafde16f327f8004&ver=2.3.1&operator=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A_46001&network=WIFI";
			$.ajax({
                url: src,
                dataType: "jsonp",
                success: function (data) {
                    var url = "";
                    if (!!data && "results" in data && "3gphd" in data.results && data.results["3gphd"].length) {
                        url = data["results"]["3gphd"][0]["url"];
					}

                    if (url) {
						that._showVideoTag(url);
                    }
                    else {
                        alert("视频播放失败");
                    }
                },
                error: function () {
                    alert("视频播放失败");
                }
            });
		},

        _showVideoTag: function (src) {
            var that = this;
				
            var video = document.createElement("video");
			video.src = src;
			video.style.cssText = "width:" + bodyWidth + "px;height:" + bodyHeight
				+ "px;position:absolute;left:0;top:0;z-index:1000";
			document.body.appendChild(video);
			video.addEventListener("playing", function () {
				this.webkitEnterFullscreen();
			});
			video.addEventListener("webkitendfullscreen", function () {
				document.body.removeChild(this);
			});
            video.play();
        }
	}
	
	return new action();
})();