<?php
namespace Widroom\Controller;
use Think\Controller;
class EmptyController extends Controller {
	public function _initialize() {
		//lvdi_widroom_logs();
		//phpinfo();
	}
	public function index(){
		set_time_limit(0); 
		$result  = M("t_huiyuan")->select();
		foreach($result as $v){
			echo $i++; echo "<br/>";
			if(!$v['house']) continue;
			$user = getInfoByTel($v['huiyuan_tel'],$v['house']);
			//$score = getCredits($v['card_no']);
			$date = array('card_no_'=>$user,'update_time'=>date("Y-m-d H:i:s"));
			M("t_huiyuan")->where('huiyuan_id='.$v['huiyuan_id'])->save($date);

			echo  M("t_huiyuan")->getLastSql();		 
		}
	}
	public function abc(){
		
		$result  = M("t_huiyuan")->where('huiyuan_id>=500')->field('huiyuan_id,huiyuan_tel,house')->limit(5)->select();	
		foreach($result as $v){
			echo $v['huiyuan_id']; echo "<br/>";
			if(!$v['house']) continue;
			$user = getInfoByTel($v['huiyuan_tel'],$v['house']);
			$date = array('card_no_'=>$user);
			//print_r($date);
			//$score = getCredits($v['card_no']);
			////$date = array('score'=>$score,'update_time'=>date("Y-m-d H:i:s"));
			M("t_huiyuan")->where('huiyuan_id='.$v['huiyuan_id'])->save($date);

			echo  M("t_huiyuan")->getLastSql();	       
			 
		}
	}
	public function a(){
		//S('wang','wang');
		//echo S('wang');
		$card = new \Common\Model\WechatModel();
		echo $w =  $card->getJsApiTicket();
		//print_r($w);
	}
	public function b(){
		$phone = '15150024565';

	}
	 	  
}