//全景 path
function show360(id, path) {
    bizapp.showpage(id);
}

//photos path
function showimages(index, imagesPathArr, contentId) {
    location.href = "invoke://showAlbum?index=" + index + "&imagesPathArr=" + JSON.stringify(imagesPathArr) + "&contentId=" + contentId;
}

//sms share  content
function smsShare(content) {
    window.plugins.smsComposer.showSMSComposerWithCB(function () { }, '', content);
}

function txWeiboShare(content) {
    var cnt = "http://v.t.qq.com/share/share.php?pic=&title=" + content;
    window.open(encodeURI(cnt), '_blank', 'location=yes');
}

function weiboShareWithWebView(message) {
    window.open(encodeURI('http://v.t.sina.com.cn/share/share.php?title=' + message), '_blank', 'location=yes');
}

//weibo share  content
function weiboShare(message, contentId) {
    // location.href = "weibo://share?content="+message;
    window.open(encodeURI('http://v.t.sina.com.cn/share/share.php?title=' + message), '_blank', 'location=yes');
}

//map url
function showMap(url, contentId) {
    window.location.href = url + "&contentId=" + contentId;
}

function weiXinShare(message, contentId) {
    window.location.href = "invoke://weiXinShare?message=" + message + "&contentId=" + contentId;
}

function friendsShare(message, contentId) {
    window.location.href = "invoke://friendsShare?message=" + message + "&contentId=" + contentId;
}

function setLogHistory(id, isShare) {
    setTimeout(function () {
        window.location.href = "invoke://setLogHistory?id=" + id + "&isShare=" + isShare;
    });
}

function getAppDeviceId(callback) {
    navigator.applicationPreferences.get('device_app_id', callback, callback);
}

function setCheckUpdateState(state) {//state = true || false
    window.loaction.href = "invoke://setCheckUpdateState?state=" + state;
}

function getLinkManId(callback) {
    navigator.applicationPreferences.get('linkman_id', callback, callback);
}

function setLinkManId(id, callback) {
    navigator.applicationPreferences.set('linkman_id', id, callback, callback);
}

function getServerRootPath(callback) {
    navigator.applicationPreferences.get('server_root_path', function (value) {
        callback(value + "api");
    }, callback);
}

function getShareUrl(callback) {
    navigator.applicationPreferences.get('share_path', callback, callback);
}

function getAppName(callback) {
    navigator.applicationPreferences.get('app_name', callback, callback);
}

//default 1000  禁止进入  
//changed 1001  第一次打开
//        1002  n次
function SocialMarketingState(callback) {
    if (navigator.onLine) {
        navigator.applicationPreferences.get('social_marketing_state', function (value) {
            if (value == "1002") {
                callback(value);
            } else if (value == "1001") {
                getAppDeviceId(function (deviceId) {
                    if (deviceId == "") {
                        callback("1000");
                    } else {
                        callback("1001");
                    }
                })
            }
        }, function () { bizapp.errorLog("SocialMarketingState"); });
    } else {
        callback("1000");
    }
}

function changeSocialMarketingState() {
    navigator.applicationPreferences.set('social_marketing_state', "1002", function (value) {
    }, function () { bizapp.errorLog("changeSocialMarketingState"); })
}

function showPDF(pdfPath) {
    location.href = "invoke://showPDF?pdfPath=" + pdfPath;
}

function appConfig(jsonArray) {
    var target = "invoke://config?";
    var param = "";
    for (key in jsonArray) {
        param += key + "=" + jsonArray[key] + "&";
    }
    if (param.length > 1) {
        param = param.substr(0, param.length - 1);
    };
    location.href = target + param;
}

var callback_cache = [], cache_index = 0;
function listSourceByContentId(contentId, callback) {
    var key = "listSourceByContentId" + (cache_index++);

    callback_cache[key] = function (list) {
        var key_cache = key;
        callback(list);
        delete callback_cache[key];
    };
    location.href = "invoke://listSourceByContentId?contentId=" + contentId + "&callbackId=" + key;
}

function showInfBrowser(url) {
    location.href = "invoke://showInBrowser?url=" + url;
}

function addOnceForShareCount() {
    location.href = "invoke://addOnceForShareCount";
}

function getPushContentId(callback) {
    navigator.applicationPreferences.get('push_content_id', function (value) {
        if (value != "") {
            navigator.applicationPreferences.set('push_content_id', "", function (value) {
            }, function () { alert(error); })
        }
        callback(value);
    });
}
function playerMusic(path) {
    location.href = "invoke://playMusic?path=" + path;
}
function stopMusic() {
    location.href = "invoke://stopMusic";
} 

var playState = 0;
function setPlayState(bl) {
    playState = bl;
}

function showVideo(path) {
    location.href = "invoke://showVideo?path=" + path;
} 

function setTouch(canTouch) {
    location.href = "invoke://setTouch?canTouch=" + canTouch;
}

function maopao(message){
    setTimeout(function(){
        location.href = "invoke://maopao?message="+message;    
    },0)
	
}