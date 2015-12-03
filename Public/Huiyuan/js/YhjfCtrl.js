var YhjfCtrl = (function () {
	var that;
	var obj = function () {
		that = this;
	};
	obj.prototype = {
		ctrl: function ($scope, $http, $timeout) {
			that.$http = $http;
			that.$scope = $scope;
			that.$timeout = $timeout;
			that.$scope.limitWord = that.limitWord;
			that.$scope.detail = that.detail;
			that.$scope.CashTransDetail = that.CashTransDetail;
			that.$scope.TransDetail = that.TransDetail;

			that.$scope.balence = that.$scope.LastCash = 0;
			that.$scope.balence = balence;
			that.$scope.LastCash = LastCash;
			if (!that.userInfo) {
				that.getUserInfo();
			} else {
				that.init();
			}
		},

		init:function()
		{
			that.$scope.userInfo = that.userInfo;
		   
		 
		},

		limitWord: function (ProName) {
			//var ProName = "商户名称商户名称商户名称商户名称";
			//if (ProName.length > 12) {
			//    return ProName.substring(0, 11) + "...";
			//} else {
			//    return ProName;
			//}
		},

		detail:function()
		{
			window.location.href = 'Jfxq.html';
		},
		CashTransDetail: function () {
			that.$scope.jfCashTitle = "消费详情";
			that.$scope.jfCashType = "（元）";
			that.$scope.list = new Array();
			that.$scope.jfCashShow = true;
			
			Util.ajax(that.$http, {
				method: "POST",
				data: {
					cardNo: that.userInfo.CardNo,
					cardNoSign: that.userInfo.CardNoSign
				},
				url: Util.getApiUrl("GetCashTransDetail")
			}, function (data) {
				that.$scope.list = data.txnArea;

				$(".userListSilder").css('height', data.txnArea.length * 51 + 'px');
				new iScroll('userListIscroll', { vScrollbar: false, hScroll: false });
			});
		}, 
		TransDetail: function () {
			$("#detailnew").removeClass("hide");
			$("#beforepage").addClass("hide");
			$.post("/huiyuan.php/Integral/transDetail",
                            	{
                               		openId:$("#openid").val()
                           	},
                           	function(data,status){       
                           		$(".userListSilder").html(data);
                                    });  
		   
		},back: function () {
			$("#detailnew").addClass("hide")
			$("#beforepage").removeClass("hide")
				//$(".userListSilder").css('height', data.txnArea.length * 51 + 'px');
				//new iScroll('userListIscroll', { vScrollbar: false, hScroll: false });
		   
		}, getUserInfo: function () {
			Util.ajax(that.$http, {
				method: "POST",
				data: {
					openId: that.openId
				},
				url: Util.getApiUrl("Login")
			}, function (data) {
				if (!data.CardNo) {
					Util.info("尚未注册，请登入注册页面");
				} else {
					that.userInfo = data;
					LocalStorage.set("userInfo", JSON.stringify(data));
					that.init();
				}
			});
		}
	};

	return new obj();
})();