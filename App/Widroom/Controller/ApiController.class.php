<?php
namespace Widroom\Controller;
use Think\Controller;
/**
 * 南京智慧办公接口 V1.0
 * author:soonsang date:2015-11-04
 */
class ApiController extends EmptyController {
	 
	//openid 验证
	public function checkOpenid(){
		$openid = I("openid");
		$result  = array('userOpenId'=>$openid,'isExist'=>'0');
		if(!$openid)  {
			$result['userOpenId'] = '0';
			$this->ajaxReturn($result);
		}
		// //会员认证
		if(M('t_huiyuan')->where(array('open_id'=>$openid))->find()){
			$result['isExist']  = 1;
		}
		$this->ajaxReturn($result);
	}
	public function access_token(){
		$this->ajaxReturn(array('access_token'=>wx_access_token()));
	}
	//模板消息发送
	public function template_send(){
		$openid = I('openid');
		if(!$openid) 
			$this->ajaxReturn(array('errcode'=>'1','errmsg'=>'failed'));
		$url = C('WX.SEND_TMP_URL').wx_access_token();
		$data=array('touser'=>$openid,
					'template_id'=>C('WX.SEND_TMP_ID'),
					'url'=>I('url'),
					'data'=>array(  
						'first'=>array('value'=>'您好，您的房产证办理进展已更新。'),
						'keynote1'=>array('value'=>'叠翠峰三期9-402'),
						'keynote2'=>array('value'=>'房屋交付'),
						'remark'=>array('value'=>'信息:您的房屋已交付，万科将向您发送办证通知，请在收到通知后按通知准备相关资料，启动产权办理手续如有疑问，请拨打客服热线4001234567')
					)
				);
		//$url = "http://a.forcent.cn/ldh/widroom.php/api/access_token";
		//print_r($data);
		$data = json_encode($data);
		$ch = curl_init();
		curl_setopt($ch,CURLOPT_URL,$url);
		curl_setopt($ch,CURLOPT_HTTPHEADER,0);
		curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($ch,CURLOPT_RETURNTRANSFER,0);
		curl_setopt($ch,CURLOPT_POST,TRUE);
		curl_setopt($ch,CURLOPT_POSTFIELDS,$data);
		$result = curl_exec($ch);
		$info = curl_getinfo($ch);
		curl_close($ch);
		if(!$result) $result = array('errcode'=>'1','errmsg'=>'failed');
		$this->ajaxRetuen($result);
	}
	 
}