<?php
//简单手机六位随机数
function phone_random() {
	$code = '';
	while (strlen($code) < 6) {
		$code .= mt_rand(0, 9); // 随机起始点
	}
	return $code;
}

/* * ***************************** 微信相关函数 Begin ****************************** */
//判断是否是在微信浏览器里
function isWeixinBrowser() {
	$agent = $_SERVER['HTTP_USER_AGENT'];
	if (!strpos($agent, "icroMessenger")) {
		return false;
	}
	return true;
}

//获取openid (just a moment)
function wx_openid() {
	if ($_GET['openid']) {
		session('openid', $_GET['openid']);
	}
	if (!session('openid')) {
		$url = "http://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
		$url_param = str_replace(array("/", "+", "="), array(":", "|", ";"), base64_encode($url));
		redirect("http://a.forcent.cn/ldh/api.php/Wechatapi/openid?callback=" . $url_param);
	}
	return session('openid');
}

//获取SignPackage签名
function getSignPackage() {
	$card = new \Common\Model\WechatModel();
	return $card->getSignPackage();
}

//获取access_token
function getAccessToken() {
	$card = new \Common\Model\WechatModel();
	return $card->getAccessToken();
}

//获取openid
function getOpenId() {
	if(I('openid')){
		session('openid',I('openid'));
	}
	$openid = session('openid');
	if (empty($openid) && isWeixinBrowser()) {
		$card  = new \Common\Model\WechatModel(); 
		$card->getOpenId();	
	}
	return (string) $openid;
}

/* * *****************************   微信相关函数 End   ****************************** */


/* * ***************************** Sand相关函数 Begin ****************************** */

//sand 接口调用日志
function sand_api_call() {
	$map['date_key'] = date("Y-m-d");
	if (M("t_trace_no")->where($map)->find())
		M("t_trace_no")->where($map)->setInc('date_code');
	else
		M("t_trace_no")->add($map);
}

//获取会员信息
function userInfo($cardNo) {
	$card = new \Common\Model\SandCardModel($cardNo);
	$data = $card->userInfo();
	return $data;
}

//获取积分
function getCredits($cardNo) {
	$card = new \Common\Model\SandCardModel($cardNo);
	$data = $card->creditsBalance();
	return $data;
}

//增加积分
function addCredits($cardNo, $qty) {
	$card = new \Common\Model\SandCardModel($cardNo);
	$data = $card->creditsAdd((int) $qty);
	return $data;
}

//扣除积分
function deductCredits($cardNo, $qty) {
	$card = new \Common\Model\SandCardModel($cardNo);
	$data = $card->creditsDeduction((int) $qty);
	return $data;
}

//手机号码 获取卡号 edit by sun
function getInfoByTel($phoneNo, $issMemId, $cardNo = '') {
	$card = new \Common\Model\SandCardModel($cardNo);
	$data = $card->getCardNoByPhone($phoneNo, $issMemId);
	return $data;
}

//交易记录
function tradeRecords($cardNo, $limit = 100) {
	$card = new \Common\Model\SandCardModel($cardNo);
	$data = $card->tradeRecords($limit);
	return $data;
}

//积分详情记录
function scoreRecords($cardNo) {
	$result = tradeRecords($cardNo);
	$list = $result['txnArea']; //print_r($list);
	array_walk($list, 'scoreAction');
	$list = array_filter($list, 'da');
	return $list;
}

function scoreAction(&$value, $key) {
	if (in_array($value['procCode'], array(9827, 9837))) {//增加积分
		$datetime = date("Y-m-d H:i:s", strtotime($value['txnDate'] . $value['txnTime']));
		$str = $value['procCode'] == 9827 ? '+' : '-';
		$qty = $str . $value['txnDtlArea'][0]['qty'];
		$value = array('merchName' => $value['merchName'], 'procCode' => $value['procCode'], 'datetime' => $datetime, 'qty' => $qty);
	} else {
		$value = array();
	}
}

function da($v) {
	if ($v)
		return true;
	else
		return false;
}

/**
 * 根据手机号、代号更新卡号
 * @param type $phoneNo
 * @param type $issMemId
 * 
 */
function updateCardNoByPhone($phoneNo, $issMemId, $card_no) {
	$cardNo = S('cardNo');
	//file_put_contents('sun_yong.txt', $cardNo);
	if (!empty($cardNo)) {
		return $cardNo;
	}
	$db_dsn = 'mysql://root:5tgbvfr4@127.0.0.1:3306/lvdi_ihuiyuan';
    $model = M('Huiyuan', 't_', $db_dsn);

	$data['key'] = 'fc123456';
	$data['phoneNo'] = $phoneNo;
	$data['issMemId'] = $issMemId;

	if (isset($issMemId) && isset($phoneNo)) {
		$url = 'http://121.40.241.219:8080/sand/?ct=getCardNoByPhone';
		$oCurl = curl_init();
		curl_setopt($oCurl, CURLOPT_URL, $url);
		curl_setopt($oCurl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($oCurl, CURLOPT_POST, TRUE);
		curl_setopt($oCurl, CURLOPT_POSTFIELDS, $data);
		$sContent = curl_exec($oCurl);
		$aStatus = curl_getinfo($oCurl);
		curl_close($oCurl);
		file_put_contents('sun_yong.txt', json_encode($sContent));
		if (intval($aStatus["http_code"]) == 200) {
			$response = json_decode($sContent, true);
			if ($card_no != $response['cardNo']) {
				//file_put_contents('aaaa.txt', '111');
				$sql = "UPDATE t_huiyuan SET card_no='" . $response['cardNo'] . "', update_time='" . date('Y-m-d H:i:s') . "'  WHERE huiyuan_tel='" . $phoneNo . "'";
				S('ldhusers', null);
				$model->execute($sql);
			} else {
				S('cardNo', $card_no, 24 * 60 * 60);
			}
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

//检测会员状况
function check_vip($openid) {
	$vipCache = S('ldhusers');
	if (isset($vipCache[$openid])) {
		return $vipCache[$openid];
	}
	$db_dsn = 'mysql://lvdi_:@127.0.0.1:3306/lvdi_ihuiyuan';
	$model = M('Huiyuan', 't_', $db_dsn);
	$map['open_id'] = $openid;
	$rs = $model->where($map)->find();
	if ($rs) {
		$bool = updateCardNoByPhone($rs['huiyuan_tel'], $rs['house'], $rs['card_no']); //更新会员卡号
		//file_put_contents('sun_yong1.txt', $bool);
		if (!$bool) {
			$vipCache[$openid] = $rs;
			S('ldhusers', $vipCache, 24 * 60 * 60);
		} else {
			$rs = $model->where($map)->find();
		}
		return $rs;
	} else {
		return false;
	}
}


//获取项目名称
function getCodeNameByHouse($house) {
    $arr = S('houses');
    if (isset($arr[$house])) {
        return $arr[$house];
    }

    $db_dsn = 'mysql://lvdi_:@127.0.0.1:3306/lvdi_ihuiyuan';
    $model = M('Code_detail', 't_', $db_dsn);
    $map['code_key'] = $house;
    if ($rs = $model->where($map)->getField('code_name')) {
        $arr[$house] = $rs;
        S('houses', $arr);
        return $rs;
    } else {
        return false;
    }
}

//获取会员卡级别
function getSaleByCardNo($cardNo) {
	$arr = S('level');
	if (isset($arr[$cardNo])) {
		return $arr[$cardNo];
	}

	$db_dsn = 'mysql://lvdi_:@127.0.0.1:3306/lvdi_ihuiyuan';
	$model = M('Huiyuan_level', 't_', $db_dsn);
	$map['level_no'] = substr($cardNo, 0, 4);
	$level = $model->where($map)->getField('level_name');
	if ($level) {
		if ($level == "黑钻卡") {
			$sale = 0.5;
		}
		if ($level == "银卡") {
			$sale = 0.7;
		}
		if ($level == '金卡') {
			$sale = 0.6;
		}
		$arr[$cardNo] = $sale;
		S('level', $arr);
		return $sale;
	} else {
		return false;
	}
}

//token
function wx_access_token(){
	return trim(file_get_contents('http://a.forcent.cn/ldh/api.php/Wechatapi/access_token'),'"');
}


//获取用户头像
function getWxBaseInfo($openid) {
	//echo $openid;exit;
	$url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' . wx_access_token() . '&openid=' . $openid . '&lang=zh_CN';
	//echo $url;exit;
	$arr = json_decode(http_get($url), true);
	//print_r($arr);exit;
	return $arr['headimgurl'];
}

/* * ***************************** Sand相关函数 End ****************************** */


/**
 * GET 请求
 * @param string $url
 */
function http_get($url) {
	$oCurl = curl_init();
	if (stripos($url, "https://") !== FALSE) {
		curl_setopt($oCurl, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($oCurl, CURLOPT_SSL_VERIFYHOST, FALSE);
		curl_setopt($oCurl, CURLOPT_SSLVERSION, 1); //CURL_SSLVERSION_TLSv1
	}
	curl_setopt($oCurl, CURLOPT_URL, $url);
	curl_setopt($oCurl, CURLOPT_RETURNTRANSFER, 1);
	$sContent = curl_exec($oCurl);
	$aStatus = curl_getinfo($oCurl);
	curl_close($oCurl);
	if (intval($aStatus["http_code"]) == 200) {
		return $sContent;
	} else {
		return false;
	}
}

/**
 * 粉丝检测
 */
function checkFans($openid, $redirect, $ajax = null) {
    $bool = R('Api/Fans/updateFansByOpenid', array($openid));
    //echo $bool;exit;
    // echo 11;exit;
    if ($ajax) {
        if ($bool === true) {
            $url = 'http://a.forcent.cn/iHuiyuan/user/Integral?url=' . urlencode($redirect);
        } else {
            $url = 'http://mp.weixin.qq.com/s?biz=MjM5ODg1MDI2OA==&mid=209800739&idx=1&sn=54b350a36b6655303eadca02c425ddb9#rd';
        }
        return $url;
    } else {
        if ($bool === true) {
            redirect('http://a.forcent.cn/iHuiyuan/user/Integral?url=' . urlencode($redirect));
        } else {
            redirect('http://mp.weixin.qq.com/s?biz=MjM5ODg1MDI2OA==&mid=209800739&idx=1&sn=54b350a36b6655303eadca02c425ddb9#rd');
        }
    }
}

/**
 * 系统时间
 * @return type 
 */
function getSysTime() {
	return date('Y-m-d H:i:s');
}

/**
 * 获取客户端ip地址
 * @return type 
 */
function getcip() {
	if (getenv("HTTP_CLIENT_IP") && strcasecmp(getenv("HTTP_CLIENT_IP"), "unknown"))
		$ip = getenv("HTTP_CLIENT_IP");
	else if (getenv("HTTP_X_FORWARDED_FOR") && strcasecmp(getenv("HTTP_X_FORWARDED_FOR"), "unknown"))
		$ip = getenv("HTTP_X_FORWARDED_FOR");
	else if (getenv("REMOTE_ADDR") && strcasecmp(getenv("REMOTE_ADDR"), "unknown"))
		$ip = getenv("REMOTE_ADDR");
	else if (isset($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] && strcasecmp($_SERVER['REMOTE_ADDR'], "unknown"))
		$ip = $_SERVER['REMOTE_ADDR'];
	else
		$ip = FALSE;
	return $ip;
}

?>