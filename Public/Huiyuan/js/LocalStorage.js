var LocalStorage = (function () {
	var obj = function () {
		this.ajaxCount = 0;
	};

	obj.prototype = {
		set: function (key, value) {
			localStorage[key] = value;
		},

		get: function (key) {
			return localStorage[key];
		}
	};

	return new obj();
})();