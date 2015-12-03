//全景 path
function show360(id, path) {
    var m = path.replace("/index.html", "");
    var jingList = {
        url: m
    };

    navigator.IntentStart.quanjing(jingList, function () {

    });
}
function maopao(message){
    // var maolist = {
     //   msg: message
   // };
	 var mapList = {
        msg: message
     
    };
	//navigator.IntentStart.maopao(maolist, function () {});
	 navigator.IntentStart.maopao(mapList, function () { });

}
//photos path
function showimages(el, imgs, id) {
    var ResourceIds = imgs;

    var imageList = [];
    for (cont = 0; cont < ResourceIds.length; cont++) {
        var ResourceUrl = ResourceIds[cont];
        imageList.push({
            url: ResourceUrl,
            id: el
        });
    }

    navigator.IntentStart.photo(imageList, function () { });
}

//sms share  content
function smsShare(content) {
	 var urlList = [];
    urlList.push({
        url: "urls"
    });
	 navigator.IntentStart.tongji(urlList, function () { });
    window.location.href = "sms:?body=" + content;
}

//weibo share  content
function weiboShare(content) {
    var urlList = [];
    urlList.push({
        url: "urls"
    });
	 navigator.IntentStart.tongji(urlList, function () { });
    window.open(encodeURI('http://v.t.sina.com.cn/share/share.php?title=' + content), '_blank', 'location=yes');
}

function txWeiboShare(content) {
    window.open("http://v.t.qq.com/share/share.php?pic=&title=" + content, '_blank', 'location=yes');
}

//map url
function showMap(url, contentId) {
    //invoke://showNativeMaps?lat=31.00283&lon=121.34347
    var m = url.split("=");
    var LatitudeAry = m[1].split("&");
    var Latitudes = LatitudeAry[0];
    var longitudes = m[2]; //31.00283
    var mapList = {
        Latitude: Latitudes,
        longitude: longitudes,
        contentId: contentId
    };
    navigator.IntentStart.start(mapList, function () { });
}

//vedio
function playvedio(urls) {

    var urlList = [];
    urlList.push({
        url: urls
    });
    navigator.IntentStart.vedio(urlList, function () { });
}

function setLogHistory(ids) {
    var idList = [];

    idList.push({
        ids:ids
    });
   navigator.IntentStart.setvisitid(idList, function () { });
	
}

function getLinkManId(callback) {

    navigator.applicationPreferences.get('LinkmanID', callback, callback);
}

function setLinkManId(id, callback) {
    navigator.applicationPreferences.set('LinkmanID', id, callback, callback);
}

function getServerRootPath(callback) {
    navigator.applicationPreferences.get('server_root_path', callback, callback);
}

function getAppName(callback) {
    navigator.applicationPreferences.get('app_name', callback, callback);
}

function getAppDeviceId(callback) {
    navigator.applicationPreferences.get('APPDeciceId', callback, callback);
}

function weiXinShare(message, contentId) {
    var urlList = [];
    urlList.push({
        context: message
    });
    navigator.IntentStart.weixin(urlList, function () { });
}

function friendsShare(message, contentId) {
    var urlList = [];
    urlList.push({
        context: message
    });
    navigator.IntentStart.friends(urlList, function () { });
}

function SocialMarketingState(callback) {
    showHud("加载中...");
    if (navigator.onLine) {
        navigator.applicationPreferences.get('social_marketing_state', function (value) {
            if (value == "1002") {
                callback(value);
                hideHud();
            } else if (value == "1001") {
                getAppDeviceId(function (deviceId) {
                    if (deviceId == "") {
                        callback("1000");
                        hideHud();
                    } else {
                        hideHud();
                        callback("1001");
                    }
                })
            }
        }, function (data) {
			hideHud();
			alert("加载失败，请稍后重试");
            bizapp.errorLog("SocialMarketingState失败"+JSON.stringify(data) );
        });
    } else {
        callback("1000");
        hideHud();
    }
}

function changeSocialMarketingState() {
    navigator.applicationPreferences.set('social_marketing_state', "1002", function (value) { }, function () {
        bizapp.errorLog("changeSocialMarketingState");
    })
}
var androidphonrgaphud=false;
function showHud() {
if(!androidphonrgaphud){
var urlList = [];
    urlList.push({ 
	 
    });
   androidphonrgaphud=true;
	    navigator.IntentStart.open(urlList, function () { });
}

}
function hideHud() {
if(androidphonrgaphud){
 var urlList = [];
    urlList.push({ 
	 
    });
   androidphonrgaphud=false;
	    navigator.IntentStart.close(urlList, function () { });
}
   
}


function showInfBrowser(url) {
	if(url.indexOf('linkoutbrowser') > 0){
		showInActivity(url);
	}else{
    	window.open(encodeURI(url), '_blank', 'location=yes');
	}
}

function showInActivity(urls) {
    var urlList = [];
    urlList.push({
        url: urls
    });
    navigator.IntentStart.showInfBrowser(urlList, function () { });
}

function getShareUrl(callback) {
    navigator.applicationPreferences.get('source', callback, callback);
}

function openalert(callback) {
    navigator.applicationPreferences.open('open', callback, callback);
}

function getPushContentId(callback) {
    navigator.applicationPreferences.get('contentId', function(tpid){
		  navigator.applicationPreferences.set('contentId', '', callback, callback);
		callback(tpid);
	}, callback);
}

function showVideo(path) {
    var urlList = [];
    urlList.push({
        paths: path
    });
    navigator.IntentStart.playmp4(urlList, function () { });
}
var callback_cache = [], cache_index = 0;
function listSourceByContentId(contentId, callback) {
    var key = "listSourceByContentId" + (cache_index++);

    callback_cache[key] = function (list) {
	
        var key_cache = key;
        callback(eval(list));
        delete callback_cache[key];
    };
	   var urlList = [];
    urlList.push({
        url: contentId,
		key:key
    });
    navigator.IntentStart.listSourceByContentId(urlList, function (val) {
		var strs= new Array();
		strs=val.split(":"); 
	
				callback_cache[strs[1]](strs[0]);
	});
}
function setHudText(text){
	//调用外壳传递text
	var urlList = [];
    urlList.push({
        msg: text
    });
    navigator.IntentStart.count(urlList, function () { });
}
function playerMusic(filename){

	var urlList = [];
    urlList.push({
        msg: filename
    });
navigator.IntentStart.startmusic(urlList, function () { });
}
function  stopMusic(){

var urlList = [];
    urlList.push({ 
	 
    });
navigator.IntentStart.stopmusic(urlList, function () { });
}
var playState = 0;
function setPlayState(bl) {
    playState = bl;
}