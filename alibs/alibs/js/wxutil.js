// JavaScript Document
function gotoPage(contentId, data, dateTime, appName) {
	switch (data.type) {
		case "Album":
			doShowImages(data.data);
			break;
		case "Plugin":	
			break;
		case "Catalog":
		case "InfoCatalog":
			if('click' in document.body){
				linkToPageByATag('html_' + contentId + '.html?' + getParams() + '&dt='+dateTime); 
			}else{
				window.open('http://a.mo2.cn/res/'+appName+'/weixin/html_' + contentId + '.html?' + getParams() + '&dt='+dateTime, 'new title'+contentId, true);
			}
			break;
		case "Article":
			if('click' in document.body){
				linkToPageByATag('html_' + contentId + '.html?dt='+dateTime); 
			}else{
				window.open('http://a.mo2.cn/res/'+appName+'/weixin/html_' + contentId + '.html?dt='+dateTime, 'new title'+contentId, true);
			}
			break;
		case "Vr360":
			Action.show360('../'+data.data+'?dt='+dateTime, '../'+data.data.replace('index.html','weixin.swf')+'?dt='+dateTime);
			break;
		case "ActionGPS":
			var gps = data.data.lat + ',' + data.data.lon
			Action.showMap(gps);
			break;
		case "ActionWB":
			var shareContent = data.data.replace('{url}','http://a.mo2.cn/'+appName);
			Action.sinaShare(shareContent);
			break;
		case "ActionSMS":
			var smsContent = data.data.replace('{url}','');
			Action.sendMsg(smsContent); // todo {url}
			break;
		case "ActionTEL":
			Action.callPhone(data.data);
			break;
		case "ResourcePackage":
			window.open('../html/' + contentId + '/index.html?dt='+dateTime, '');
			break;
		case "ActionWXQuan":
			Action.pyqShare();
			break;
		case "ActionWX":
			Action.weixinShare();
			break;
		case "InnerLink":
			Action.redirect('../' + data.data + '?dt='+dateTime);
			break;
		case "ActionOutLink":
			Action.redirect(data.data);
			break;
		case "File":
			// 不支持
			break;
		case "OfflineVideo":
			// 不支持
			break;
		default:
			break;
	}
	
	function doShowImages(imgs){
		var images = [];
		for (i = 0; i < imgs.length; i++) {
			images[i] = 'http://a.mo2.cn/res/' + appName + '/' + imgs[i];
		}

		Action.showImages(0, images);
	}
	
	function linkToPageByATag(url){
		if(document.getElementById('temp_a_link')){
			document.getElementById('temp_a_link').href = url
			document.getElementById('temp_a_link').click();
			return;
		}
		var aEle = document.createElement('a');  
		aEle.href = url;  
		aEle.id = "temp_a_link";
		aEle.target = '_blank';  
		document.body.appendChild(aEle); 
		aEle.click();
	}
}

var gotopage = gotoPage;

var deviceInfo = (function(){
	var deviceInfo = {};
	deviceInfo.iosVersion = (function(){
			var v = navigator.userAgent.match(/.*?iPhone\s+OS\s+(\d)[_]\d([_]\d)?\s+like/);
			if (v && v.length == 3) {
				return v[1] * 1;
			}
			else {
				return -1;
			}
		})();
	deviceInfo.isIos = !!navigator.userAgent.match(/(i[^;]+\;(U;)? CPU.+Mac OS X)/);
	deviceInfo.isAndroid = (function () {
            var ua = navigator.userAgent,
            _isAndroid = ua.indexOf('Android') > -1 || ua.indexOf('Linux') > -1;
            return _isAndroid;
        })();
	return deviceInfo;
})();

var request = { 
　	QueryString : function(val) { 
		var uri = window.location.search; 
		var re = new RegExp("" +val+ "=([^&?]*)", "ig"); 
		return ((uri.match(re))?(uri.match(re)[0].substr(val.length+1)):null); 
	}
};

function getParamKeyValue(url){
	var obj = {};
	var reg = /([a-z]+)=([^&?]*)/ig;
	while(r = reg.exec(url)) {   
		//alert(r[0] + "  " + r[1] + "  " + r[2]);   
		obj[r[1]] = r[2];
	} 
	return obj;
}

// 替换参数
function replaceParamValue(url){
	var paramObj = getParamKeyValue(location.href);
	for(var key in paramObj){
		url = url.replace('{' + key + '}', paramObj[key]);
	}
	
	url = url.replace('{appid}', appInfo.appId);
	
	return url;
}

// 拼接参数
function getParams(){
	var param = '';
	var paramObj = getParamKeyValue(location.href);
	for(var key in paramObj){
		if(param != ''){
			param = param + '&';
		}
		param = param + key + '=' + paramObj[key];
	}
	return param;
}