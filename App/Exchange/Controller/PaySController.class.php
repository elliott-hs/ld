<?php

namespace Store\Controller;

use Think\Controller;

class PaySController extends CommonController {

    //登录成功的查询所属商户下的商品列表
    function productList() {
        $sid = intval($_REQUEST['sid']);
        $gc = M('Score_product');
        $data = $gc->where('sid=' . $sid)->select();
        $this->getStoreNameById($sid);
        $this->assign('list', $data);
        $this->assign('sid', $sid);
        $this->display('loginsuccess');
    }

    //保存二维码数据
    function doAdd() {
        $gc = M('Score_qrcode');
        $mode = M('Score_qrproduct');
        $sid = rtrim($_REQUEST['pid'],',');
        $sidArr = explode(',', $sid);
        $count = count(explode(',', $sid));
        $arr['sid'] = intval($_REQUEST['sid']);
        $arr['uid'] = getwxuserid();
        $arr['score'] = $_REQUEST['score'];
        $arr['price'] = $_REQUEST['price'];
        $arr['ctime'] = $this->crtTime();
        $state = $gc->add($arr);
        if ($state) {
            for ($i = 0; $i <= $count - 1; $i++) {
                $dataList_type[] = array(
                    'uid' => getwxuserid(),
                    'qid' => $state,
                    'pid' => $sidArr[$i],
                    'ctime' => $this->crtTime()
                );
            }
            $qpsate = $mode->addAll($dataList_type);
        }
        if ($state && $qpsate) {
            $data['status'] = 1;
            $data['qid'] = $state;
            $data['sid'] = $_REQUEST['sid'];
            $this->ajaxReturn($data);
            //redirect('qrcode?qid=' . $state . '&sid=' . $_POST['ssid']);
        }else{
            $data['status'] = 0;
            $data['info'] = "订单生成失败!";
            $this->ajaxReturn($data);
        }
    }

    //显示二维码
    function qrcode() {
        header("Content-type: text/html; charset=utf-8");
        $id = intval($_GET['qid']); //二维码ID
        $sid = intval($_GET['sid']); //商户ID
        $mod = M('Score_order');
        $gc = M('Score_qrcode');
        $where['qid'] = $id;
        $where['status'] = 2;
            
        //查询二维码状态
        if (2 == $gc->where('id=' . $id)->getField('status')) {
            if(isset($sid)){
                $sid = getwxsid();
            }
            redirect('productList?sid='.$sid);
        } else {
            $this->getQrproductByQid($id);
            $str = urlencode(base64_encode('?id=' . $id . '&uid=' . getwxuserid()));
            $url = 'http://a.forcent.cn/ldh/store.php/PayM/requestQrcode/' . $str;
            $this->getStoreNameById($sid);
            $this->assign('url', $url);
            $this->assign('qid', $id);
            $this->assign('sid', $sid);
            $this->display();
        }
    }

    //查询二维码扫描结果
    function qrcodeRs() {
        $id = intval($_GET['qid']); //二维码ID
        $sid = intval($_GET['sid']); //商户ID
        $mod = M('Score_order');
        $gc = M('Score_qrcode');
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
                redirect('productList?sid=1');
            } else {
                redirect('qrcode?qid=' . $id . '&sid=' . $sid);
            }
        }
    }
    
    //查询订单记录
    function orderList(){
        $mod = M('Score_order');
        $where['sid'] = $_REQUEST['sid'];
        $where['paytime'] = array('like','%'.date('Y-m-d').'%');
        $where['uid'] = getwxuserid();
        $where['status'] = 2;
        $data = $mod->where($where)->select();
        //echo $mod->getLastSql();
        $this->assign('list',$data);
        $this->display('order');
    }
    
    //显示订单明细
    function showorder(){
        $id = $_REQUEST['id'];
        $this->orderDetail($id);
        $this->display('desc');
    }

}
