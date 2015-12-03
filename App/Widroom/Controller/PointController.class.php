<?php
namespace Widroom\Controller;
use Think\Controller;
/**
 * 南京智慧办公 功能入口 
 * author:soonsang date:2015-11-04
 */
class PointController extends EmptyController {

	//门禁指向
	public function pdoor(){
		$openid = wx_openid();
		if(!$openid) exit('门禁模块加载失败...请退出重试');
		if(!C('POINT_URL.DOOR'))  exit('系统错误');
		redirect(C('POINT_URL.DOOR').'?openid='.$openid);
	}

	//访客认证
	public function visitor(){
		$openid = wx_openid();
		if(!$openid) exit('门禁模块加载失败...请退出重试');
		$url  = 'http://tomcat.massky.cn/WeChatNanJing/customerVisitor';
		redirect($url.'?openid='.$openid);
	}

	//业主认证
	public function owner(){
		$openid = wx_openid();
		if(!$openid) exit('门禁模块加载失败...请退出重试');
		$url = 'http://tomcat.massky.cn/WeChatNanJing/customerOwner';
		redirect($url.'?openid='.$openid);
	}

	//车场指向
	public function pcar(){
		$openid = wx_openid();
		if(!$openid) exit('停车场模块加载失败...请退出重试');
		if(!C('POINT_URL.CAR'))  exit('系统错误');
		redirect(C('POINT_URL.CAR').'?openid='.$openid);
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
			$this->signPackage = getSignPackage(); 
			$this->display();

		}

	}
	public function test(){
		session(I('w'),I('w'));
		print_r(session());
	}

	 
}