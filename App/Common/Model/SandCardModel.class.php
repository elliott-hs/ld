<?php
namespace Common\Model;
/**
 * Created by PhpStorm.
 * User: chary
 * Date: 2015/8/4
 * Time: 14:56
 * Description: 杉德会员卡接口
 */

/*
 * 操作码
 * Processing Code  Transaction Name
			7567    余额查询
			9767    会员注册
			9517    交易记录查询
			9537    会员资料查询
			9827    赠券
			9837    WS积分抵扣
 * */

/*错误码
 *
 * Code Terminal Display
	00  成功
	20  卡片未注册
	21  PIN错误
	25  卡片已注册
	26  会员数据未正确填写
	27  错误的会员数据异动方式
	28  会员数据不存在
	29  CustId重复
	30  不支援要变更的卡片状态
	33  卡片已激活
	34  卡片未激活
	35  卡片已失效
	39  移转数量不可<=0
	40  积分点未设定
	41  同卡不能移转
	42  超过退货天数限制
	45  超过移转上限
	47  卡种不存在
	48  卡面代号不存在
	49  超过虚拟卡可发卡数量
	50  卡号自订字段长度不为3
	51  发卡单位简码长度不为6
	A0  System Error
	A1  SQL Fail
	B8  Unpack发现讯息栏位有少
	C0  卡片状态不合法或卡片代号不存在
	C1  卡片有效期过期
	C2  发卡单位不存在
	C3  特店代号不存在
	C4  端末代号不存在
	C9  交易验证码不合法
	CD  余额不足
	D3  找不到交易资料
 *
 * */
class SandCardModel{
	private $options = array(
		'MIT'               =>  '660066990000001',
		'TID'               =>  '00000001',
		'BONUS_ID'          =>  '3300000002',
		'CASH_BONUS_ID'     =>  '3100000608'
	);
	private $WSDL_URL = 'http://116.205.3.5:8443/GateWay/Service?wsdl';
	private $MODE = 'UAT';  //UAT测试环境，PRD生产环境

	public function  __construct ($cardNo, $mode='PRD') {
		$this->options['cardNo'] = $cardNo;
		$this->MODE = $mode;

		//测试环境
		if($this->MODE == 'UAT'){
			//$cardNo = "6001660066000000010"; //测试卡号，对应会员编号4096
			$this->options['MIT']           = '660066000000001';
			$this->options['TID']           = '66010001';
			$this->options['BONUS_ID']      = '3300000034';
			$this->options['CASH_BONUS_ID'] = '3100000608';
			$this->WSDL_URL = 'http://116.205.3.4:8443/GateWay/Service?wsdl';
		}
	}

	/*
	 * soap请求
	 * 抛出错误 todo
	 * */
	private function soapRequest($params){
		$soap = new \SoapClient($this->WSDL_URL);
		$output = $soap->process(json_encode($params));
		//$output = $soap->__soapCall( "process", array( json_encode($params) ) );
		$output = json_decode($output, true);
		return $output['respCode']=='00' ? $output : array();
	}

	//基础参数赋值
	private function baseParams(){
		$params['mti'] = "0200";
		$params['procCode'] = "";
		$params['reqDate'] = date('Ymd');
		$params['reqTime'] = date('His');
		$params['merchId'] = $this->options['MIT'];
		$params['termId'] = $this->options['TID'];
		$params['traceNo'] = $this->getTraceNo();
		$params['cardNo'] = $this->options['cardNo'];
		return $params;
	}

	/*
	 * 序号, 同一端末同一天不能重复
	 * 数字(0~9) 6 bytes
	 * 待优化须增加事务 todo
	 * */
	private function getTraceNo(){
		$key = 'sandTranceNo';
		if( $NO = S($key) ){
			$NO = (int)$NO + 1;
		}else{
			$NO = 500000;
		}
		S ( $key, $NO, 24*60*60 );
		return (string)$NO;
	}

	/*
	 * 会员资料查询
	 * 这个接口杉德那暂时没给我们开放
	 * */
	public function userInfo(){
		$params = $this->baseParams();
	  	$params['procCode'] = "9537";
	  	 $data = $this->soapRequest($params);
		return $data;
	 	//   return array();
	}

	/*
	 * 积分余额查询
	 * */
	public function creditsBalance(){
		$qty = 0;
		$params = $this->baseParams();
		$params['procCode'] = "7567";
		$data = $this->soapRequest($params);
		foreach($data['balanceArea'] as $v){
			if($v['bonusId']==$this->options['BONUS_ID']){
				$qty = $v['qty'];
				break;
			}
		}
		return $qty;
	}

	/*
	 * 交易记录
	 * $inqTxnNum   預設 10 筆, 最多 100筆
	 * */
	public function tradeRecords($inqTxnNum=10){
		$params = $this->baseParams();
		$params['procCode'] = "9517";
		$params['inqTxnNum'] = $inqTxnNum;
		$data = $this->soapRequest($params);
		return $data;
	}

	/*
	 * 积分增加(赠券)
	 * $addQty 增加值
	 * 如成功则返回增加后的积分余额，如不成功则返回false
	 * */
	public function creditsAdd($addQty){
		$qty = 0;
		$params = $this->baseParams();
		$params['procCode'] = "9827";

		//交换加点区
		$params['xhgAddArea'] = array(
			'cardNo'    =>  $this->options['cardNo'],
			'bonusDtl'  =>  array(
				array(
					'bonusId'   =>  $this->options['BONUS_ID'],
					'startDate' =>  '',
					'endDate'   =>  '',
					'qty'       =>  (string)$addQty
				)
			)
		);

		//交换扣点区
		$params['xhgMinusArea'] = null;
		//        $params['xhgMinusArea'] = array(
		//            'cardNo'    =>  $this->options['cardNo'],
		//            'pin'       =>  '',
		//            'bonusDtl'  =>  array(
		//                'bonusId'   =>  $this->options['BONUS_ID'],
		//                'startDate' =>  '',
		//                'endDate'   =>  '',
		//                'qty'       =>  '0',
		//                'isFee'     =>  'N',
		//            )
		//        );
		$data = $this->soapRequest($params);

		//获取余额积分
		foreach($data['balAreaAdd'] as $v){
			if($v['bonusId']==$this->options['BONUS_ID']){
				$qty = $v['qty'];
				break;
			}
		}
		return $data ? $qty : false;
	}

	/*
	 * 积分抵扣
	 * $redeemQty   Len: 10 byte，Format: 9(8)v99, 2位小数
	 * 如果抵扣成功则返回剩余积分，否则返回false
	 * */
	public function creditsDeduction($redeemQty){
		$qty = 0;
		$params = $this->baseParams();
		$params['procCode'] = "9837";
		$params['redeemQty'] = $redeemQty;
		$data = $this->soapRequest($params);
		foreach($data['balanceArea'] as $v){
			if($v['bonusId']==$this->options['BONUS_ID']){
				$qty = $v['qty'];
				break;
			}
		}
		return $data?$qty:false;
	}
	
	
	/**
	 * 根据手机号码查询卡号信息
	 * @param type $phoneNo
	 * @param type $issMemId
	 * @return type
	 */
	public function getCardNoByPhone($phoneNo,$issMemId) {

		$params = $this->baseParams();
		$params['procCode'] = "9777";
		$params['cardHolderArea'] = array(
			'name' => "",
			'custId' => "",
			'gender' => "",
			'birthday' => "",
			'phoneNo' => $phoneNo,
			//email = EMAIL,
			'prtRcpFlag' => "R",
			'chkPinFlag' => "Y",
			'actionFlag' => "M",
			'issMemId' => $issMemId
		);
		$url = "http://a.forcent.cn/IhuiYuan/User/phpsha1?str1=".$params['reqDate']."&str2=".$params['merchId'] ."&str3=". $params['termId']."&str4=".$params['traceNo']."";
		$params['chkVal']= file_get_contents($url);
		$data = $this->soapRequest($params);
		return $data ? $data['cardNo'] : false;
	}

}
