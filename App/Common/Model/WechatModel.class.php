<?php
namespace Common\Model;
class WechatModel{
	private $appId;
	private $appSecret;

  	public function __construct($appId='', $appSecret='') {
		$this->appId = $appId?$appId:C('weixin2.appId');
		$this->appSecret = $appSecret?$appSecret:C('weixin2.appSecret');
 	}
	public function getOpenId(){
		$callback = $this->callback();
		$param['appid'] = $this->appId;
		if (!isset($_GET['getOpenId'])) {
			$param['redirect_uri'] = $callback . '?getOpenId=1';
			$param['response_type'] = 'code';
			$param['scope'] = 'snsapi_base';
			$param['state'] = 1;
			$url = 'https://open.weixin.qq.com/connect/oauth2/authorize?' . http_build_query($param) . '#wechat_redirect';
			redirect($url);
		} elseif ($_GET['code']) {
			$param['secret'] = $this->appSecret;
			$param['code'] = $_GET['code'];
			$param['grant_type'] = 'authorization_code';
			$url = 'https://api.weixin.qq.com/sns/oauth2/access_token?' . http_build_query($param);
			$res = http_get($url);
			$openid = json_decode($res);
			session('openid',$openid->openid);
			$callback .= '&openid='.$openid->openid ;
			redirect($callback);
		}
	}

	private function callback(){
		$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
		$callback = "$protocol$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
		return $callback;
	}

	public function getSignPackage() {
		$jsapiTicket = $this->getJsApiTicket();
		
		// 注意 URL 一定要动态获取，不能 hardcode.
		$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
		$url = "$protocol$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";

		$timestamp = time();
		$nonceStr = $this->createNonceStr();

		// 这里参数的顺序要按照 key 值 ASCII 码升序排序
		$string = "jsapi_ticket=$jsapiTicket&noncestr=$nonceStr&timestamp=$timestamp&url=$url";

		$signature = sha1($string);

		$signPackage = array(
			"appId"     => $this->appId,
			"nonceStr"  => $nonceStr,
			"timestamp" => $timestamp,
			"url"       => $url,
		 	"signature" => $signature,
		  	"rawString" => $string
		);
		return $signPackage; 
  	}

	private function createNonceStr($length = 16) {
		$chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		$str = "";
		for ($i = 0; $i < $length; $i++) {
		  $str .= substr($chars, mt_rand(0, strlen($chars) - 1), 1);
		}
		return $str;
	}

	public  function getJsApiTicket() {
		// jsapi_ticket 应该全局存储与更新，以下代码以写入到文件中做示例
		$data = S('jsapi_ticket');
		if (!$data) {
			$accessToken = $this->getAccessToken();
			// 如果是企业号用以下 URL 获取 ticket
			// $url = "https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=$accessToken";
			$url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=$accessToken";
			$res = json_decode($this->httpGet($url));
			$ticket = $res->ticket;
			if ($ticket) {
				S('jsapi_ticket',$ticket,$res->expires_in-200);
			}
		}else {
			$ticket = $data ;
		}
		return $ticket;
	}
	public function getAccessToken() {
		// access_token 应该全局存储与更新，以下代码以写入到文件中做示例
		$data = S('access_token');
		if (!$data) {
			//如果是企业号用以下URL获取access_token
			//$url = "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=$this->appId&corpsecret=$this->appSecret";
			$url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=$this->appId&secret=$this->appSecret";
			$res = json_decode($this->httpGet($url));
			$access_token = $res->access_token;
			if ($access_token) {
				S('access_token',$access_token,$res->expires_in-200);
			}
		}else {
		  	$access_token = $data;
		}
		return $access_token;
	}

	private function httpGet($url) {
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_TIMEOUT, 500);
		// 为保证第三方服务器与微信服务器之间数据传输的安全性，所有微信接口采用https方式调用，必须使用下面2行代码打开ssl安全校验。
		// 如果在部署过程中代码在此处验证失败，请到 http://curl.haxx.se/ca/cacert.pem 下载新的证书判别文件。
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($curl, CURLOPT_SSLVERSION, 1); //CURL_SSLVERSION_TLSv1
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_URL, $url);	
		$res = curl_exec($curl);
		//$res = file_get_contents($url);
		return $res;
	}
}
?>