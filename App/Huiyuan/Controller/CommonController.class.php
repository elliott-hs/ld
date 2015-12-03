<?php
namespace Huiyuan\Controller;

use Think\Controller;
/**
 * 公共控制器
 */
class CommonController extends Controller
{    
	public function  __construct(){
		parent::__construct();
		$v = isWeixinBrowser();
		//if(!$v)  exit('open in weachatd!');
		//$this->openid  = 'sssss';
		//if(!$this->openid)  die('缺失');
	}
	public function openid(){
		if($_GET['openid']) {
			session('openid',$_GET['openid']);
		}
		if(!session('openid')) {
			$url="http://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
			$url_param = str_replace( array("/","+","="), array(":","|",";"), base64_encode($url) );
			redirect("http://a.forcent.cn/ldh/api.php/Wechatapi/openid?callback=".$url_param);
		}
		return  session('openid'); 
	}
	public function _empty(){
		echo '<img src="/ld/Public/Huiyuan/images/error.jpg"  alt="sos" />';
	}

}