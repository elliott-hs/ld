(function(cordova){
    var IntentStart = function () {};
    IntentStart.prototype.start = function(maplist, cb) {

        cordova.exec(cb, cb, 'IntentStartPlug', "map", [maplist]);
    };
    IntentStart.prototype.quanjing = function(maplist, cb) {

        cordova.exec(cb, cb, 'IntentStartPlug', "360", [maplist]);
    };
    IntentStart.prototype.photo = function(maplist, cb) {

        cordova.exec(cb, cb, 'IntentStartPlug', "photo", maplist);
    };
   IntentStart.prototype.vedio = function(maplist, cb) {

        cordova.exec(cb, cb, 'IntentStartPlug', "vedio", maplist);
    };
	  IntentStart.prototype.setvisitid = function(maplist, cb) {
        cordova.exec(cb, cb, 'IntentStartPlug', "set", maplist);
    };
	   IntentStart.prototype.weixin = function(maplist, cb) {

        cordova.exec(cb, cb, 'IntentStartPlug', "weixin", maplist);
    };
	  IntentStart.prototype.friends = function(maplist, cb) {

        cordova.exec(cb, cb, 'IntentStartPlug', "friends", maplist);
    };
	 IntentStart.prototype.open = function(maplist, cb) {

        cordova.exec(cb, cb, 'IntentStartPlug', "open", [maplist]);
    };
	  IntentStart.prototype.close = function(maplist, cb) {

        cordova.exec(cb, cb, 'IntentStartPlug', "close", maplist);
    };
	 IntentStart.prototype.tongji = function(maplist, cb) {

        cordova.exec(cb, cb, 'IntentStartPlug', "tongji", maplist);
    };	  
	  IntentStart.prototype.showInfBrowser = function(maplist, cb) {

        cordova.exec(cb, cb, 'IntentStartPlug', "showInfBrowser", maplist);
    };
    IntentStart.prototype.playmp4 = function (maplist, cb) {

        cordova.exec(cb, cb, 'IntentStartPlug', "playmp4", maplist);
    };
	IntentStart.prototype.maopao = function (maplist, cb) {
        cordova.exec(cb, cb, 'IntentStartPlug', "maopao", [maplist]);
    };
	IntentStart.prototype.listSourceByContentId = function (maplist, cb) {

        cordova.exec(cb, cb, 'IntentStartPlug', "list", maplist);
    };
	IntentStart.prototype.startmusic = function (maplist, cb) {

        cordova.exec(cb, cb, 'IntentStartPlug', "start", maplist);
    };
	IntentStart.prototype.stopmusic = function (maplist, cb) {

        cordova.exec(cb, cb, 'IntentStartPlug', "stop", maplist);
    };
    navigator.IntentStart = new IntentStart();

})(window.cordova || window.Cordova)