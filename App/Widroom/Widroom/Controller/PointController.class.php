<?php
namespace Widroom\Controller;
use Think\Controller;
/**
 * 南京智慧办公 功能入口 
 * author:soonsang date:2015-11-04
 */
class PointController extends Controller {
	
	//车场指向
	public function pcar(){
		$openid = wx_openid();
		if(!$openid) exit('停车场模块加载失败...请退出重试');
		if(!C('POINT_URL.CAR'))  exit('系统错误');
		redirect(C('POINT_URL.CAR').'?openid='.$openid);
	}

	//门禁指向
	public function pdoor(){
		$openid = wx_openid();
		if(!$openid) exit('门禁模块加载失败...请退出重试');
		if(!C('POINT_URL.DOOR'))  exit('系统错误');
		redirect(C('POINT_URL.DOOR').'?openid='.$openid);
	}
	//电梯指向
	public function pelevator(){
		$openid = wx_openid();
		if(!$openid) exit('电梯模块加载失败...请退出重试');
		if(!C('POINT_URL.ELEVATOR')) exit('系统错误');
		redirect(C('POINT_URL.ELEVATOR').'?openid='.$openid);
	}
	//打印机扫一扫
	public function pprinter(){
		$openid = wx_openid();
		if(!$openid) exit('打印机模块加载失败...请退出重试');
		//if(!C('POINT_URL.PRINTER')) exit('系统错误');
		if(IS_POST&&I('scode')){
			$result = file_get_contents(C('POINT_URL.PRINTER').'?openid='.$openid);
			if($result){
				$this->ajaxReturn('ok');
			}else{
				$this->ajaxReturn('error');
			}
		}else{
			//微信转发链接配置
			 // 注意 URL 一定要动态获取，不能 hardcode.
   			$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
    			$url = "$protocol$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
			$signPackage =  file_get_contents("http://a.forcent.cn/ldh/api.php/Wechatapi/signPackage?url=".$url);
			$w   = json_decode($signPackage,true);
			//print_r($w);
			$this->signPackage =  $w;
			$this->display();

		}
		
	}
	public function _empty(){
		echo "";
	}
}