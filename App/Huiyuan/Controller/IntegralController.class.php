<?php
namespace Huiyuan\Controller;

use Think\Controller;
/**
 * 绿地会员注册
 */
class IntegralController extends CommonController
{    
	//报名，登陆
	public function index()
	{          
		//$this->openid  =  $this->openid();
		$this->openid  = 'o3Iz7jmy9NjyTWvKQ7rkNhjJNSuY';
		//会员
		$usr = M('t_huiyuan')->where(array('open_id'=>$this->openid))->find();
		//print_r($usr);
		if($usr){
			//call sand api
                                    sand_api_call();
                                    $score = getCredits($usr['card_no']);
                                    $usr['score'] = $score;
			$this->usr = $usr;
			$this->display('Yhjf');
		}else{
			$this->cityList = $this->cityList();
			$this->display();	
		}
		
	}
 	//验证登陆
	public function Regist(){
		$data = $_POST;
                        $post_data = json_decode($data['info'],true);
                        $this->openid = $data['openId'];
                        if(!$this->openid) $this->ajaxReturn('1');
		// 验证码验证 
                        
		$authCode = M("t_authcode")->where(array('tel'=>$post_data['huiyuan_tel']))->order('id desc')->find();
		
		if($post_data['authCode']!=$authCode['authcode']){
			$this->ajaxReturn('5');
		}
		//sand 接口
		$card_no = getInfoByTel($post_data['huiyuan_tel'],$post_data['house']);
		if(!$card_no)  $this->ajaxReturn('4'); 
		//该微信号已绑定过卡号
		if(M('t_huiyuan')->where(array('open_id'=>$data['openId']))->find()){
 			$this->ajaxReturn('3');
		}
		//电话号码已经注册过
		if(M('t_huiyuan')->where(array('huiyuan_tel'=>$post_data['huiyuan_tel']))->find()){
			$this->ajaxReturn('2');
		}
		$post_data['card_no'] = $card_no;
		$post_data['open_id'] = $this->openid ;
		$post_data['create_time'] = date("Y-m-d H:i:s") ;
		$post_data['is_deleted'] = 1;
		M("t_huiyuan")->add($post_data);
	}

	//短信验证码发送
	public function SendCode(){
		$tel  =  I('tel');
		if(preg_match("/1[3458]{1}\d{9}$/",$tel)){	
			import('Vendor.Sms.sms');
			$sms = new \sms();	
			$mobile_code = phone_random(0,9);
			$content = "您的验证码是：" . $mobile_code . "。请不要把验证码泄露给其他人。";
			$result  = $sms->sendTo($tel,$content );
			$date = array('tel'=>$tel,'authcode'=>$mobile_code,'create_time'=>date("Y-m-d H:i:s"));
			if(2==$result['code']){
				M('t_authcode')->add($date);
				$this->ajaxReturn("1");
			}else{
				$this->ajaxReturn($result);
			}
		}else{
			$this->ajaxReturn('手机号码不正确');
		}
	}	   
		   
	//城市楼盘
	private function cityList(){
		$city = M("t_code_detail")->where(array('code_id'=>'10'))->order('id')->select();
		$tmp ='<option value="-1">请选择</option>';
		foreach($city  as $v){
			$tmp .= '<option value="'.$v['code_key'].'">'.$v['code_name'].'</option>';
		}
		return $tmp;
	}
	//城市楼盘详情
	public function GetCodeDetail(){
		$codeId =I('codeId');
		if($codeId)
			$project = M("t_code_detail")->where(array('code_id'=>$codeId))->select();
		$tmp ='';
		foreach($project  as $v){
			$tmp .= '<option value="'.$v['code_key'].'">'.$v['code_name'].'</option>';
		}
		file_put_contents('ww.txt',M("t_code_detail")->getLastSql());
		echo ($tmp);
	}
	public function test(){
		$card  =  getOpenId();
		print_r($card);
	}
	public function checkMember(){
		$result = getInfoByTel(I('tel'),I('house'));
		if($result)   $this->ajaxReturn(1);
	}
	public function transDetail(){
		if(I('openId')){
			$card_no = M('t_huiyuan')->where(array('open_id'=>I('openId')))->field('card_no')->find();
			$result = scoreRecords($card_no['card_no']);
			//echo M('t_huiyuan')->getLastSql();
		}
		$tmp ='';
		if($result){
			foreach ($result as  $v) {
				$tmp .= '<div class="div_mingxi">
					<div style="border-bottom: 1px dashed white;width: 90%;margin-left: 5%;float: left;">
						<div class="shop">
							<div style="height: 25px;line-height: 35px;">'.$v['merchName'].' 
								 
							</div>
							<div style="height: 25px;line-height: 20px;font-size: 12px;" >
								'.$v['datetime'].'
							</div>
						</div>
						<div class="jifen">
							<span>'.$v['qty'].'</span>
						</div>
					</div>
				</div>';
			}
		}
		
		echo $tmp;	
	}

}