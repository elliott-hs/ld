<?php
namespace Huiyuan\Controller;

use Think\Controller;
/**
 * 绿地会员注册
 */
class TellController extends CommonController
{    
	//报名，登陆
	public function index()
	{          
		echo $openid = getOpenId();
		print_r(session());
	}
	public function te(){
		print_r(C());

		session(I('w'),I('w'));
		print_r(session());
	}
	public function show(){
		//$w = getInfoByTel('15949027607','66006601');
		//$w = userInfo('6006660066000006240');
		phpinfo();
		print_r($w);
	}
	public function a(){
		$w = wx_openid();
		//print_r(session('openid',null));
		print_r($w);
	}

}