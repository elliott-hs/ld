var IntegralCtrl = (function () {
	var that;
	var obj = function () {
		that = this;
	};

	obj.prototype = {

		ctrl: function ($scope, $http, $timeout) {
			// that.$http = $http;
			// that.$scope = $scope;
			// that.$timeout = $timeout;
			// that.$scope.login = that.login;
			// that.$scope.SendAuthCode = that.SendAuthCode;
			// that.$scope.projectList = that.projectList;
			// that.init();
		},

		init: function () {
			// var opt = {
			// 	preset: 'date', //日期
			// 	theme: 'jqm', //皮肤样式
			// 	display: 'modal', //显示方式 
			// 	mode: 'clickpick', //日期选择模式
			// 	dateFormat: 'yy-mm-dd', // 日期格式
			// 	setText: '确定', //确认按钮名称
			// 	cancelText: '取消',//取消按钮名籍我
			// 	dateOrder: 'yymmdd', //面板中日期排列格式
			// 	dayText: '日', monthText: '月', yearText: '年',
			// 	endYear: (new Date()).getFullYear() + 3 //结束年份
			// };
 			//$('#datetimepicker').scroller(opt);
			// //城市一览
			// Util.ajax(that.$http, {
			// 	method: "POST",
			// 	data: {
			// 		codeId: '10'
			// 	},
			// 	url: Util.getApiUrl("GetCodeDetail")
			// }, function (data) {
			// 	that.$scope.cityList = data;
			// });
		},

		SendAuthCode: function () {
			var  tel= $(".card").val() ;
			if(!Util.isMobile(tel)){
				Util.info("请填写您的手机号");
				return '';
			}
			//计时器
			var slide;
			j = 60
			$(".codeData").html("重新发送60");
			$(".codeData").css({ "display": "inline-block" });
			$(".sendcode").css({ "display": "none" });
			slide = setInterval(function () {
				if (j > 0) {
					$(".codeData").html("重新发送"+j);
				}
				else {
					$(".sendcode").css({ "display": "inline-block" });
					$(".codeData").css({ "display": "none" });
				}

				j--;
			}, 1000);			 
			$.post("SendCode",
                            	{
                               		tel:tel 
                           	},
                           	function(data,status){             	 
                                    });  
		},
		login: function ()
		{
                                     var card = new Object();
                                     card.huiyuan_name= $('#HuiyuanName').val();
                                     card.sex= 1;
                                     card.birthday= $('#Birthday').val();
                                    //card.Project= $('#citySelc').val();
                                     card.house= $('#projectde').val();
                                     card.huiyuan_tel= $('.card').val();
                                     card.authCode= $('#code').val();

			//window.location.href = 'Yhjf';
			if (!card || !card.huiyuan_name) {
				Util.info("请填写姓名");
				return;
			}
			if (!card || !(card.sex == '1' || card.sex == '0')) {
				Util.info("请填写性别");
				return;
			}


			if (!card || !card.birthday) {
				Util.info("请填写生日");
				return;
			}
			if (!card || !card.huiyuan_tel) {
				Util.info("请填写您的手机号");
				return;
			}
			if (!card || !card.authCode) {
				Util.info("请填写短信验证码");
				return;
			}

			if (!card || !card.house) {
				Util.info("请填写项目");
				return;
			}

			$.post("Regist",
                            	{
                               		openId: $('#openid').val(),
				info:  $.toJSON(card) 
                           	},
                           	function(data,status){ 

                           		switch (data) {
					case '1':

					case '2':
						Util.info("电话号码已经注册过");
						break;
					case '3':
						Util.info("该微信号已绑定过卡号");
						break;
					case '4':
						$('.div_messages').show();
						//Util.info("该号码不是会员");
						break;
					case '5':
						Util.info("验证码错误");
						break;
					default:
						Util.info("登录成功");
						//LocalStorage.set("openId", that.openId);
						//LocalStorage.set("userInfo", JSON.stringify(data));
						window.location.href = 'index';
						break;
				}
                                    });  	 
		},
		projectList: function (codeId) {
			$.post('GetCodeDetail',
                            	{
                               		codeId:codeId   
                           	},
                           	function(data,status){ 
                           		$('#projectde').html(data);
                                    });  
		},
		hid: function () {
			$('.div_messages').hide();
		},
		checkMember: function () {
			var tel = $('.card').val(); //电话号码
			var house =  $('#projectde').val() ;//楼盘
			if(!Util.isMobile(tel)){
				Util.info("请填写您的手机号");
				return '';
			}
			if(tel&&house){
				$.post("checkMember",
                            		{
                               			tel:tel ,
                               			house:house
                           		},
                           		function(data,status){       
                           			if(!data)   $('.div_messages').show();	 
                                    	});  
			}
			 
		}
		 
	};

	return new obj();
})();