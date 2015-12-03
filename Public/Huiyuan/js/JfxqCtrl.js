var JfxqCtrl = (function () {
    var that;
    var obj = function () {
        that = this;

        var user = LocalStorage.get("userInfo");
        if (user) {
            that.userInfo = JSON.parse(user);
        }
        that.openId = LocalStorage.get("openId");
    };

    obj.prototype = {
        ctrl: function ($scope, $http, $timeout) {
            that.$http = $http;
            that.$scope = $scope;
            that.$timeout = $timeout;
            that.$scope.back = that.back;
            that.$scope.save = that.save;
            that.onlickflag = false;
            if (!that.userInfo) {
                that.onlickflag = true;
                that.getUserInfo();
            }
        },

        save: function (obj) {
            if (!obj.oldPassword) {
                Util.info("请填写之前的密码");
                return;
            }
            if (!obj.password || !obj.password2) {
                Util.info("请填写新密码");
                return;
            }
            if (obj.password!=obj.password2) {
                Util.info("两次填写的密码请相同");
                return;
            }

            if (!that.onlickflag) {
                that.onlickflag = true;
            } else {
                Util.inof("请稍等。。。");
                return;
            }

            Util.ajax(that.$http, {
                method: "POST",
                data: {
                    cardNo: that.userInfo.CardNo,
                    cardNoSign: that.userInfo.CardNoSign,
                    pin: obj.oldPassword,
                    newPin: obj.password2
                },
                url: Util.getApiUrl("ModifyPin")
            }, function (data) {
                if (data.respCode == "00")
                {
                    Util.info("修改成功");
                    setTimeout(function () {
                        history.go(-1);
                    },1000);
                    
                }
                else if (data.respCode == "21")
                {
                    that.onlickflag = false;
                    Util.info("原密码错误");
                    return;
                }
                else {
                    that.onlickflag = false;
                    Util.info("修改失败");
                    return;
                }
            });
        },

        back: function () {
            history.go(-1);
            //window.location.href = 'Yhjf?openId=' + that.openId;
        }, getUserInfo: function () {
            if (that.openId) {
                Util.ajax(that.$http, {
                    method: "POST",
                    data: {
                        openId: that.openId
                    },
                    url: Util.getApiUrl("Login")
                }, function (data) {
                    that.onlickflag = false;
                    if (!data.CardNo) {
                        Util.info("尚未注册，请登入注册页面");
                    } else {
                        LocalStorage.set("userInfo", JSON.stringify(data));
                        that.userInfo = data;
                    }
                });
            } else {
                Util.info("无法确认身份信息，请重新进入！");
            }
        }
    };

    return new obj();
})();