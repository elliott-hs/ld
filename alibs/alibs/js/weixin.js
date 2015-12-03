document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);

// URL:http://a.mo2.cn/wxcall/dl518
// Token:asdfgh
// AppId:wx37e7618441810c61
// AppSecret:ed8b039854ef329ed51890e05a165ce4
function onBridgeReady() {

	bindWxShare();
	
	bindFriendQuan();
	
	bindWeibo();
	
	// 隐藏右上角的选项菜单入口;
	//WeixinJSBridge.call('hideOptionMenu');
};

/**
 *  分享到微信
 */
function bindWxShare(){
	var msg = wxGetValue(shareMsg, shareConfig.wxDesc);
	if(msg == null)
		return;
	
	var title = wxGetValue(shareTitle, contentTitle, shareConfig.wxTitle);
	var icon = wxGetValue(shareIcon, shareConfig.imgUrl);
	var appId = appInfo.weixinAppId;
	
	WeixinJSBridge.on('menu:share:appmessage',
		function(argv) {
			WeixinJSBridge.invoke('sendAppMessage', {
				"appid": appId,
				"img_url": icon,
				"img_width": "640",
				"img_height": "640",
				"link": linkUrl,
				"desc": msg,
				"title": title
			},
			function(res) {})
		}
	);
}

/**
 *  分享到朋友圈;
 */
function bindFriendQuan(){
	var msg = wxGetValue(shareMsg, shareConfig.wxFriendsDesc);  
	if(msg == null)
		return;
	
	var title = wxGetValue(shareTitle, contentTitle, shareConfig.wxFriendsTitle);
	var icon = wxGetValue(shareIcon, shareConfig.imgUrl);
	var appId = appInfo.weixinAppId;
	
	WeixinJSBridge.on('menu:share:timeline',
		function(argv) {
			WeixinJSBridge.invoke('shareTimeline', {
				"appid": appId,
				"img_url": icon,
				"img_width": "640",
				"img_height": "640",
				"link": linkUrl,
				"desc": title,
				"title": msg
			},
			function(res) {});
		}
	);
}

/**
 *  分享到微博;
 */
function bindWeibo(){
	var content = wxGetValue(shareMsg, shareConfig.weiboDesc);
	if(content == null)
		return; 
		
	WeixinJSBridge.on('menu:share:weibo',
	function(argv) {
		WeixinJSBridge.invoke('shareWeibo', {
			"content": content + linkUrl,
			"url": linkUrl
		},
		function(res) {});
	});
}

/**
 * 微信验证是否有值
 */
function wxGetValue(val1, val2, val3){
	if(val1 != null && val1 != '' && val1 != undefined)
		return val1;
	
	if(val2 != null && val2 != '' && val2 != undefined)
		return val2;
	
	if(val3 != null && val3 != '' && val3 != undefined)
		return val3;
		
	return null;
}