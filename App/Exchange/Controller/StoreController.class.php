<?php

namespace Exchange\Controller;

use Think\Controller;

class StoreController extends CommonController {

    //登录成功的查询所属商户下的商品列表
    function productList() {
        $sid = intval($_REQUEST['sid']); //商家ID
        $cateid = intval($_REQUEST['cateid']);
        $where['sid'] = $sid;

        $gc = M('Exchange_product');
        $data = $gc->where($where)->select(); //查询商家商品

        $this->getStoreNameById($sid); //查询商家名称
        $this->assign('list', $data);
        $this->assign('sid', $sid);
        $this->display('loginsuccess');
    }

    //异步加载商品列表
    function pListByCateId() {
        $sid = intval($_REQUEST['sid']); //商家ID
        $cateid = intval($_REQUEST['cateid']);
        $where['sid'] = $sid;
        if (!empty($cateid)) {
            $where['cateid'] = $cateid;
        }
        $gc = M('Exchange_product');
        $data = $gc->where($where)->select(); //查询商家商品
        if ($data) {
            $json['status'] = 1;
            $json['data'] = $data;
            $this->ajaxReturn($json);
        } else {
            $json['status'] = 0;
            $json['info'] = "数据加载失败";
            $this->ajaxReturn($json);
        }
    }

    //保存二维码数据
    function doAdd() {
        $gc = M('Exchange_qrcode');
        $mode = M('Exchange_qrproduct');
        $pid = rtrim($_REQUEST['pid'], ','); //选择的商品ID
        $pidArr = explode(',', $pid);
        $count = count(explode(',', $pid));
//        
        $pnum = rtrim($_REQUEST['pnum'], ','); //选择的商品ID
        $pnumArr = explode(',', $pnum);
        //$count = count(explode(',', $pnum));

        $productInfo = M('Exchange_product')->where('id=' . $_REQUEST['pid'])->find();
        if ($productInfo['num'] >= $productInfo['total']) {
            $data['status'] = 0;
            $data['info'] = "库存不足!";
            $this->ajaxReturn($data);
        } else {
            $arr['sid'] = intval($_REQUEST['sid']);
            $arr['uid'] = getwxuserid();
            $arr['score'] = $_REQUEST['score'];
            // $arr['price'] = $_REQUEST['price'];
            $arr['ctime'] = $this->crtTime();
            $state = $gc->add($arr); //生成二维码ID
            if ($state) {
                $qrarr['uid'] = getwxuserid();
                $qrarr['qid'] = $state;
                $qrarr['pid'] = $_REQUEST['pid'];
                $qrarr['ctime'] = $this->crtTime();
//            for ($i = 0; $i <= $count - 1; $i++) {
//                $dataList_type[] = array(
//                    'uid' => getwxuserid(),
//                    'qid' => $state,
//                    'pid' => $pidArr[$i],
//                  //  'num' => $pnumArr[$i],
//                    'ctime' => $this->crtTime()
//                );
//            }
                $qpsate = $mode->add($qrarr); //创建二维码商品关系数据
            }
            if ($state && $qpsate) {
                $data['status'] = 1;
                $data['qid'] = $state;
                $data['sid'] = $_REQUEST['sid'];
                $this->ajaxReturn($data);
                //redirect('qrcode?qid=' . $state . '&sid=' . $_POST['ssid']);
            } else {
                $data['status'] = 0;
                $data['info'] = "订单生成失败!";
                $this->ajaxReturn($data);
            }
        }
    }

    //显示二维码
    function qrcode() {
        header("Content-type: text/html; charset=utf-8");
        $qid = intval($_GET['qid']); //二维码ID
        $sid = intval($_GET['sid']); //商户ID
        $mod = M('Exchange_order');
        $gc = M('Exchange_qrcode');
        $where['qid'] = $qid;
        $where['status'] = 2;

        //查询二维码状态
        if (2 == $gc->where('id=' . $qid)->getField('status')) {
            if (isset($sid)) {
                $sid = getwxsid();
            }
            redirect('productList?sid=' . $sid);
        } else {
            $this->getQrproductByQid($qid, null);
            $str = urlencode(base64_encode('?id=' . $qid . '&uid=' . getwxuserid()));
            $url = 'http://a.forcent.cn/ldh/exchange.php/Member/requestQrcode/' . $str;
            //$url = 'http://192.168.18.129/lvdihui/exchange.php/Member/requestQrcode/' . $str;
            $this->getStoreNameById($sid); //获取商家名称
            $this->assign('url', $url);
            $this->assign('qid', $qid);
            $this->assign('sid', $sid);
            $this->display();
        }
    }

    //查询二维码扫描结果
    function qrcodeRs() {
        $id = intval($_GET['qid']); //二维码ID
        $sid = intval($_GET['sid']); //商户ID
       // echo $sid;exit;
        $mod = M('Exchange_order');
        $gc = M('Exchange_qrcode');
        $where['qid'] = $id;
        $where['status'] = 2;
        $rs = $mod->where($where)->find(); //刷新之后查询订单信息
        if ($rs) {
            $this->assign('data', $rs);
            $this->assign('img', getWxBaseInfo($rs['openid']));
            $this->getStoreNameById($sid);
            $this->display('paysuccess');
        } else {
            //查询二维码状态
            if (2 == $gc->where('id=' . $id)->getField('status')) {
                redirect('productList?sid='.$sid);
            } else {
                redirect('qrcode?qid=' . $id . '&sid=' . $sid);
            }
        }
    }

    //查询订单记录
    function orderList() {
        $mod = M('Exchange_order');
        $where['sid'] = $_REQUEST['sid'];
        // $where['paytime'] = array('like', '%' . date('Y-m-d') . '%');
        $where['uid'] = getwxuserid();
        $where['status'] = 2;
        $data = $mod->where($where)->order('paytime desc')->select();
        //echo $mod->getLastSql();
        $this->assign('list', $data);
        $this->display('order');
    }

    //显示订单明细
    function showorder() {
        $id = $_REQUEST['id'];
        $this->orderDetail($id);
        $this->display('desc');
    }

    function phone() {
        $this->display('phone');
    }

    function checkExchange() {
        // echo getWxBaseInfo(wx_openid());exit;
        $phone = $_REQUEST['phone'];
        $where['huiyuantel'] = $phone;
        $where['status'] = 2;
        $data = M('exchange_order')->where($where)->find();
        if ($data) {
            $this->assign('show', 1);
        } else {
            $this->assign('show', 0);
        }
        $this->assign('data', $data);
        $this->assign('img', getWxBaseInfo($data['openid']));
        $this->display('phonedesc');
    }

}
