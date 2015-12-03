<?php

namespace Exchange\Controller;

use Think\Controller;

class MemberController extends CommonController {

	//会员扫描二维码处理
	function requestQrcode() {
		header("Content-type: text/html; charset=utf-8");
		$url = I('path.2'); //获取加密参数
		$linkurl = explode('&', $url);
		//echo count($linkurl);exit;
		if (count($linkurl) > 1) {
			$value = base64_decode($linkurl[0]);
		} else {
			$value = (base64_decode($url));
		}
		// echo $value;exit;

		$key = explode('&', $value);
		$qid = str_replace("?id=", "", $key[0]);

		$uid = str_replace("uid=", "", $key[1]);
		$mod = M('Exchange_qrcode');
		$info = $mod->where('id=' . $qid)->find(); //查询二维码基本信息
		//echo $value;exit;
		//echo exp;exit;

		$isuser = M('exchange_store')->where('id=' . $info['sid'])->getField('isuser'); //指定用户购买
		//$huiyuaninfo = array('open_id' => 'asdasd', 'huiyuan_name' => 'asdas', 'huiyuan_tel' => '256456546', 'card_no' => '456456546546'); //check_vip(wx_openid());
		$huiyuaninfo = check_vip(wx_openid());
		if ($huiyuaninfo) {
			$this->assign('name', $huiyuaninfo['huiyuan_name']);
			$this->assign('tel', $huiyuaninfo['huiyuan_tel']);
			$this->assign('img', getWxBaseInfo($huiyuaninfo['open_id']));
			//判断是否是特定用户
			if ($isuser) {
				$map['cardno'] = $huiyuaninfo['card_no'];
				$map['tel'] = $huiyuaninfo['huiyuan_tel'];
				$deserve = M('exchange_deserve')->where($map)->find();//是否是特定用户
				if (!$deserve) {
					$this->display('no');
					exit;
				}
				$arr['isuser'] = 1;//特定代码
				$where['isuser'] = 1;//特定条件
				$this->assign('data', $this->getOrderInfo(array('status' => 2, 'isuser' => 1)));//特定用户订单信息
			} else {
				$arr['isuser'] = 0;//特定代码
				$where['isuser'] = 0;//特定条件
				$this->assign('data', $this->getOrderInfo(array('status' => 2,'isuser'=>0)));//普通订单信息
			}
			$vm = D('QrcodeproductView');
			$data = $vm->where('Exchange_qrcode.id=' . $qid)->find();
			if ($data['issale'] == 1) {
				$score = $data['p_score'] * getSaleByCardNo($huiyuaninfo['card_no']);
			} else {
				$score = $data['p_score'];
			}
			$order = M('Exchange_order');
			$where['huiyuantel'] = $huiyuaninfo['huiyuan_tel'];
			$where['openid'] = $huiyuaninfo['open_id'];
			$where['status'] = 2;
			$rs = $order->where($where)->find(); //查询订单信息

			if ($info['status'] == 1) {
				$arr['sid'] = $info['sid'];
				$arr['pid'] = $data['pid'];
				$arr['uid'] = $uid;
				$arr['qid'] = $qid;
				$arr['title'] = $data['title'];
				$arr['huiyuanname'] = $huiyuaninfo['huiyuan_name'];
				$arr['huiyuantel'] = $huiyuaninfo['huiyuan_tel'];
				$arr['openid'] = $huiyuaninfo['open_id'];
				$arr['price'] = 0;
				$arr['score'] = $score;
				$arr['status'] = 1;
				$arr['card_no'] = $huiyuaninfo['card_no'];
				$arr['ctime'] = $this->crtTime();
				if ($rs) {
					//$id = $_REQUEST['id'];
					$this->orderDetail($rs['id']);
				} else {
					$state = $order->add($arr);
					$this->assign('status', 1);
				}
			} else {
				if ($rs['openid'] == $huiyuaninfo['open_id']) {
					$this->assign('info', '已支付');
				} else {
					$this->assign('info', '二维码已失效');
				}
			}
			//$this->assign('score', $data[0]['score']); //赋值积分
			$this->assign('sid', $info['sid']); //赋值商户ID
			//$this->assign('uid', $info['uid']); //赋值商户ID
			$this->assign('qid', $qid); //赋值二维码ID
			$this->assign('url', $url); //赋值二维码ID
			//  echo getWxBaseInfo($huiyuaninfo['open_id']);exit;


			$this->getQrproductByQid($qid, $huiyuaninfo['card_no']); //获取二维码订单基本信息
			$this->assign('errorinfo', "你已经兑换过了!");
			$rs ? $this->display('Store:desc') : $this->display('index');
		} else {
			$fs['openid'] = wx_openid();
			$fsdata = M('Fsopenid')->where($fs)->find();
			if ($fsdata) {
				$redirec_url = 'http://a.forcent.cn/ldh/exchange.php/Member/requestQrcode/' . $url;
				redirect('http://a.forcent.cn/iHuiyuan/user/Integral?url=' . ($redirec_url));
			} else {
				redirect('http://mp.weixin.qq.com/s?biz=MjM5ODg1MDI2OA==&mid=209800739&idx=1&sn=54b350a36b6655303eadca02c425ddb9#rd');
			}
		}

		//插入二维码扫描日志
		$arr['qid'] = $qid;
		$arr['ip'] = getcip();
		$arr['mobile'] = $_SERVER ['HTTP_USER_AGENT'];
		// $arr['huiyuanname'] = $huiyuaninfo['huiyuan_name'];
		$arr['openid'] = wx_openid();
		$arr['huiyuantel'] = $huiyuaninfo['huiyuan_tel'];
		$arr['ctime'] = $this->crtTime();
		$qrsan = M('Score_qrscanlog');
		$qrsan->add($arr);
	}

	function doAdd() {
		$data['status'] = 0;
		header("Content-type: text/html; charset=utf-8");
		$mod = M('Exchange_order');
		$gc = M('Exchange_qrcode');
		//$huiyuaninfo = check_vip(wx_openid());
		// $url = 'http://a.forcent.cn/ldh/store.php/Member/requestQrcode/' . $_REQUEST['url'];
		$qid = $_REQUEST['qid']; //二维码ID
		$data['info'] = $_REQUEST['qid'];
		//$where['uid'] = $_REQUEST['uid'];
		$orderinfo = $this->getOrderInfo(array('qid' => $qid, 'status' => 1));
		$qrinfo = $gc->where('id=' . $qid)->find(); //查询二维码信息    
		$card_no = $orderinfo['card_no']; //会员卡号
		$huiyuan_score = getCredits($card_no); //会员积分
		//判断是否需要支付金额
		if (!$orderinfo) {
			$data['info'] = '订单已失效';
			$this->ajaxReturn($data);
		}
		$productInfo = M('Exchange_product')->where('id=' . $orderinfo['pid'])->find();
		if ($productInfo['num'] >= $productInfo['total']) {
			$data['info'] = '库存不足';
			$this->ajaxReturn($data);
		} else {
			if ($huiyuan_score >= $qrinfo['score']) {
				$state = $mod->where('id=' . $orderinfo['id'])->save(array('status' => 2, 'paytime' => $this->crtTime())); //更新订单状态
				if ($state) {
					//减积分操作
					$qty = deductCredits($card_no, $orderinfo['score']);
					if ($qty) {
						$scorelog['qid'] = $orderinfo['qid'];
						$scorelog['orderid'] = $orderinfo['id'];
						$scorelog['score'] = $orderinfo['score'];
						$scorelog['huiyuantel'] = $orderinfo['huiyuantel'];
						$scorelog['huiyuanopenid'] = $orderinfo['openid'];
						$scorelog['ctime'] = $this->crtTime();
						M('Score_scorelog')->add($scorelog);
						//$sql = M('Exchange_qrcode')->getLastSql();
						// file_put_contents("./ljhasdkjahsdkjasd.txt", var_export($sql, true));
					}


					//更新二维码状态
					$udata['status'] = 2;
					$udata['utime'] = $this->crtTime();
					M('Exchange_qrcode')->where('id=' . $_REQUEST['qid'])->save($udata);
					//更新库存
					$parr['num'] = $productInfo['num'] + 1;
					M('Exchange_product')->where('id=' . $orderinfo['pid'])->save($parr);

					$data['status'] = 1;
					$this->ajaxReturn($data);
				} else {
					$data['info'] = '付款失败';
					$this->ajaxReturn($data);
				}
			} else {
				$data['info'] = '积分不足';
				$this->ajaxReturn($data);
			}
		}
	}

	//查询订单记录
	function orderList() {
		$mod = M('Exchange_order');
		$where['sid'] = $_REQUEST['sid'];
		// $where['paytime'] = array('like','%'.date('Y-m-d').'%');
		$where['openid'] = wx_openid();
		$where['status'] = 2;
		$data = $mod->where($where)->order('paytime desc')->select();
		// echo $mod->getLastSql();
		$this->assign('list', $data);
		$this->display('Store:order');
	}

	//显示订单明细
	function showorder() {
		$id = $_REQUEST['id'];
		$this->orderDetail($id);
		$this->display('Store:desc');
	}

}
