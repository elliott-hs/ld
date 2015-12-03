function gotopage(contentId, data) {
	switch (data.type) {
		case "Album":
			bizapp.showAlbumImage(data.data, contentId);
			break;
		case "Catalog":
		case "InfoCatalog":
		case "Article":
			bizapp.showpage("html_" + contentId);
			break;
		case "Vr360":
			bizapp.show360(data.data, contentId);
			break;
		case "ActionGPS":
			if (navigator.onLine || !data.data.map) {
				if (!bizapp.checkdblclick()) return;
				showMap("invoke://showMap?lat=" + data.data.lat + "&lon=" + data.data.lon, contentId);
			}
			else {
				bizapp.showAlbumImage([data.data.map], contentId);
			}
			break;
		case "ActionWB":
			if (!bizapp.checkdblclick()) return;
			weiboShare(replaceUrl(data.data));
			break;
		case "ActionSMS":
			if (!bizapp.checkdblclick()) return;
			smsShare(replaceUrl(data.data));
			break;
		case "ActionTEL":
			if (!bizapp.checkdblclick()) return;
			callLinkman(data.data, contentId, data.changeTelByLinkman);
			break;
		case "ResourcePackage":
			bizapp.showRes(data.data, contentId);
			break;
		case "ActionWXQuan":
			if (!bizapp.checkdblclick()) return;
			friendsShare(replaceUrl(data.data), contentId);
			break;
		case "ActionWX":
			if (!bizapp.checkdblclick()) return;
			weiXinShare(replaceUrl(data.data), contentId);
			break;
		case "ActionOutLink":
			if (!bizapp.checkdblclick()) return;
			showInfBrowser(data.data);
			break;
		case "File":
			if (!bizapp.checkdblclick()) return;
			showPDF("file/" + data.data);
			break;
		case "OfflineVideo":
			if ('playState' in window && playState == 1) {
				musicUtil.stopMusic();
			}
			if (!bizapp.checkdblclick()) return;
			
			if (isWinPad()) {
				bizapp._playVideoWinPad("video/" + data.data);
			}
			else {
				if ("showHud" in window) showHud("");
				bizapp._playvideoiphone("video/" + data.data);
			}
			break;
		case "InnerLink":
			if (!('ontouchstart' in window)) {
				bizapp.showShare(data.data);
			}
			else {
				SocialMarketingState(function (status) {
					switch (+status) {
						case 1000:
							alert("注册失败!");
							bizapp.errorLog("SocialMarketingState");
							break;
						case 1001:
						case 1002:
							bizapp.showShare(data.data);
							break;
						default:
							break;
					}
				});
			}
			break;
		default:
			break;
	}

	if (data.type == "ActionSMS" || data.type == "ActionWB" || data.type == "Vr360") {
		bizapp.log(contentId, undefined, data.type == "ActionSMS" || data.type == "ActionWB");
	}

	if (isAndroid() && data.type == "ActionTEL" && data.type == "Album") {
		bizapp.log(contentId);
	}
}

function replaceUrl(str) {
	return str.replace("{url}", "userUrl" in window ? userUrl : "");
}

function callLinkman(tel, contentId, changeTelByLinkman) {
	if(changeTelByLinkman == false){
		callPhone(tel, contentId);
		return; 
	}
	getLinkManId(function (id) {
		if (id && "linkmanlist" in config && id in config.linkmanlist) {
			tel = config.linkmanlist[id].Phone;
		}

		callPhone(tel, contentId);
	});
}

function callPhone(number, contentId) {
	var isAndriod = isAndroid();
	if (isAndriod) {
		location.href = "tel:" + number;
	}
	else {
		showConfirm("提示", "确定拨打" + number + "吗？", "确定,取消", function (index) {
			if (index == 1) {
				location.href = "invoke://tel?phone=" + number + "&contentId=" + contentId;
			}
		});
	}
}

function isAndroid() {
	var ua = navigator.userAgent,
        _isAndroid = ua.indexOf('Android') > -1 || ua.indexOf('Linux') > -1;

	return _isAndroid;
}

function isIOS() {
	return !!navigator.userAgent.match(/(i[^;]+\;(U;)? CPU.+Mac OS X)/);
}
 
function isWinPad() {
	return navigator.userAgent.indexOf("Windows NT") >= 0;
}

function isPC() {
	return !('ontouchstart' in window);
}

function isPad() {
	return navigator.userAgent.toLowerCase().match(/iPad/i) == "ipad";
}

function showConfirm(title, message, buttonLabels, callback) {
	if (isAndroid() || isIOS()) {
		navigator.notification.confirm(
            message,  // message
            callback,              // callback to invoke with index of button pressed
            title,            // title
            buttonLabels          // buttonLabels
        );
	}
}

function setImgSize(img) {
	img.onload = function () {
		var h = document.documentElement.clientHeight;
		if (this.height > h) {
			this.height = h;
		}
	}
}

/**
 * 播放音乐用
 */
var musicUtil = {
	beforePlayMusic:function(){
	},
	beforeStopMusic:function(){
	},
	playMusic:function(path){
		this.beforePlayMusic();
		playerMusic(path);
	},
	stopMusic:function(){
		this.beforeStopMusic();
    	stopMusic();
	}
}