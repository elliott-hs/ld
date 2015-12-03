<?php

namespace Store\Controller;

use Think\Controller;

class PayMController extends CommonController {

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
        $mod = M('Score_qrcode');
        $info = $mod->where('id=' . $qid)->find(); //查询二维码基本信息
        //echo $value;exit;
        //echo exp;exit;
        if ($uid == getwxuserid()) {
            redirect('/ldh/store.php/Store/qrcode?qid=' . $qid . '&sid=' . $info['sid']);
        } else {
            $huiyuaninfo = check_vip(wx_openid());
            // print_r($huiyuaninfo);exit;
            if ($huiyuaninfo) {
                $vm = D('QrcodeproductView');
                $data = $vm->where('Score_qrcode.id=' . $qid)->select();
                foreach ($data as $key => $value) {
                    $title .= $value['title'] . ',';
                    $pids.= $value['pid'] . ',';
                }
                $order = M('Score_order');
                $where['qid'] = $qid;
                $where['uid'] = $uid;
                //$where['status'] = 1;
                $rs = $order->where($where)->find(); //查询订单信息
                //print_r($rs);

                if ($info['status'] == 1) {
                    $arr['sid'] = $info['sid'];
                    $arr['pid'] = rtrim($pids, ',');
                    $arr['uid'] = $uid;
                    $arr['qid'] = $qid;
                    $arr['title'] = rtrim($title, ',');
                    $arr['huiyuanname'] = $huiyuaninfo['huiyuan_name'];
                    $arr['huiyuantel'] = $huiyuaninfo['huiyuan_tel'];
                    $arr['openid'] = $huiyuaninfo['open_id'];
                    $arr['price'] = $data[0]['price'];
                    $arr['score'] = $data[0]['score'];
                    $arr['status'] = 1;
                    $arr['card_no'] = $huiyuaninfo['card_no'];;
                    $arr['ctime'] = $this->crtTime();
                    if (!$rs) {
                        $state = $order->add($arr);
                        $this->assign('status', 1);
                    } else {
                        $this->assign('status', $rs['status']);
                    }
                } else {
                    if ($rs['openid'] == $huiyuaninfo['open_id']) {
                        $this->assign('info', '已支付');
                    } else {
                        $this->assign('info', '二维码已失效');
                    }
                }
                $this->assign('score', $data[0]['score']); //赋值积分
                $this->assign('sid', $info['sid']); //赋值商户ID
                $this->assign('uid', $info['uid']); //赋值商户ID
                $this->assign('qid', $qid); //赋值二维码ID
                $this->assign('name', $huiyuaninfo['huiyuan_name']);
                $this->assign('tel', $huiyuaninfo['huiyuan_tel']);
                $this->assign('img', getWxBaseInfo($huiyuaninfo['open_id']));
                $this->getQrproductByQid($qid); //获取二维码订单基本信息
                $this->display('index');
            } else {
                $fs['openid'] = wx_openid();
                $fsdata = M('Fsopenid')->where($fs)->find();
                if ($fsdata) {
                    $redirec_url = 'http://a.forcent.cn/ldh/store.php/PayM/requestQrcode/' . $url;
                    redirect('http://a.forcent.cn/iHuiyuan/user/Integral?url=' . ($redirec_url));
                } else {
                    redirect('http://mp.weixin.qq.com/s?biz=MjM5ODg1MDI2OA==&mid=209800739&idx=1&sn=54b350a36b6655303eadca02c425ddb9#rd');
                }
            }

            //插入二维码扫描日志
            $arr['qid'] = $qid;
            $arr['ip'] = get_client_ip();
            $arr['mobile'] = $_SERVER ['HTTP_USER_AGENT'];
            // $arr['huiyuanname'] = $huiyuaninfo['huiyuan_name'];
            $arr['openid'] = wx_openid();
            // $arr['huiyuantel'] = $huiyuaninfo['huiyuan_tel'];
            $arr['ctime'] = $this->crtTime();
            $qrsan = M('Score_qrscanlog');
            $qrsan->add($arr);
        }
    }

    function doAdd() {
        $data['status'] = 0;
        header("Content-type: text/html; charset=utf-8");
        $mod = M('Score_order');
        $gc = M('Score_qrcode');
        $huiyuaninfo = check_vip(wx_openid());
        $card_no = $huiyuaninfo['card_no']; //会员卡号
        $huiyuan_score = getCredits($card_no); //会员积分
        $url = $_REQUEST['url'];
        $qid = $_REQUEST['qid']; //二维码ID
        $where['qid'] = $_REQUEST['qid'];
        //$where['uid'] = $_REQUEST['uid'];
        $where['status'] = 1;
        $orderinfo = $mod->where($where)->find(); //查询订单信息
        $qrinfo = $gc->where('id=' . $qid)->find(); //查询二维码信息    
        //判断是否需要支付金额
        if ($huiyuan_score >= $qrinfo['score']) {
            if (2 == $qrinfo['status']) {
                $data['info'] = '订单已失效';
                $this->ajaxReturn($data);
            } else {
                if ($qrinfo['score'] && $qrinfo['price'] == 0) {
                  
                    $state = $mod->where($where)->save(array('status' => 2, 'paytime' => $this->crtTime())); //更新订单状态
                    if ($state) {
                        //减积分操作
                        $qty = deductCredits($card_no, $qrinfo['score']);
                        if ($qty) {
                            $scorelog['huiyuanid'] = $huiyuaninfo['huiyuan_id'];
                            $scorelog['score'] = $_REQUEST['score'];
                            $scorelog['huiyuantel'] = $huiyuaninfo['huiyuan_tel'];
                            $scorelog['huiyuanopenid'] = $huiyuaninfo['open_id'];
                            $scorelog['ctime'] = $this->crtTime();
                            M('Score_scorelog')->add($scorelog);
                            //$sql = M('Score_qrcode')->getLastSql();
                            // file_put_contents("./ljhasdkjahsdkjasd.txt", var_export($sql, true));
                        }
                        //更新二维码状态
                        $udata['status'] = 2;
                        $udata['utime'] = $this->crtTime();
                        M('Score_qrcode')->where('id=' . $_REQUEST['qid'])->save($udata);
                        $data['status'] = 1;
                        $this->ajaxReturn($data);
                    } else {
                        $data['info'] = '付款失败';
                        $this->ajaxReturn($data);
                    }
                } else {
                    $redirec_url = 'http://a.forcent.cn/ldh/store.php/PayM/requestQrcode/' . $url;
                    redirect("http://a.forcent.cn/ldh/api.php/Wxpay/score_wxpay?orderid=" . $orderinfo['id'] . "&redirect_url=" . $redirec_url);
                }
            }
        } else {
            $data['info'] = '积分不足';
            $this->ajaxReturn($data);
        }
    }

    //确认兑换、支付操作
    function doAdd1() {
        $data['status'] = 0;
        header("Content-type: text/html; charset=utf-8");
        $mod = M('Score_order');
        $gc = M('Score_qrcode');
        $huiyuaninfo = check_vip(wx_openid());
        $qrdata = $gc->where('id=' . $_REQUEST['qid'])->find(); //二维码状态
        if (2 == $qrdata['status']) {
            if ($huiyuaninfo['open_id'] == $qrdata['openid']) {
                $data['info'] = '已支付';
                $this->ajaxReturn($data);
            } else {
                $data['info'] = '订单已失效';
                $this->ajaxReturn($data);
            }
        } else {
            $where['qid'] = $_REQUEST['qid'];
            $where['uid'] = $_REQUEST['uid'];
            $where['status'] = 1;
            $card_no = $huiyuaninfo['card_no']; //会员卡号
            $huiyuan_score = getCredits($card_no);
            //$data['info'] = $_REQUEST['score'];
            // $this->ajaxReturn($data);exit;
            if ($huiyuan_score >= $_REQUEST['score']) {
                $state = $mod->where($where)->save(array('status' => 2, 'paytime' => $this->crtTime())); //更新订单状态

                if ($state) {

                    //减积分操作
                    $qty = deductCredits($card_no, $_REQUEST['score']);
                    if ($qty) {

                        $scorelog['huiyuanid'] = $huiyuaninfo['huiyuan_id'];
                        $scorelog['score'] = $_REQUEST['score'];
                        $scorelog['huiyuantel'] = $huiyuaninfo['huiyuan_tel'];
                        $scorelog['huiyuanopenid'] = $huiyuaninfo['open_id'];
                        $scorelog['ctime'] = $this->crtTime();
                        M('Score_scorelog')->add($scorelog);
                        //$sql = M('Score_qrcode')->getLastSql();
                        // file_put_contents("./ljhasdkjahsdkjasd.txt", var_export($sql, true));
                    }
                    //更新二维码状态
                    $udata['status'] = 2;
                    $udata['utime'] = $this->crtTime();
                    M('Score_qrcode')->where('id=' . $_REQUEST['qid'])->save($udata);
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
        $mod = M('Score_order');
        $where['sid'] = $_REQUEST['sid'];
        // $where['paytime'] = array('like','%'.date('Y-m-d').'%');
        $where['openid'] = wx_openid();
        $where['status'] = 2;
        $data = $mod->where($where)->select();
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
