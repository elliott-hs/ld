<?php

namespace Exchange\Controller;

use Think\Controller;

class CommonController extends Controller {

    public function _initialize() {

        if (CONTROLLER_NAME == 'Store') {
            $this->checkUserSession();
        }
    }

    //验证用户是否登录
    public function checkUserSession() {
        //if (!session('USER')) {
        if (!session('_wxuserid')) {
            echo '<script>window.location.href="' . __APP__ . '/Index/login"</script>';
        }
    }

    //生成系统时间
    protected function crtTime() {
        return date('Y-m-d H:i:s');
    }

    function getStoreNameById($id) {
        $this->assign('title', M('Exchange_store')->where('id=' . $id)->getField('title'));
    }

    function getQrproductByQid($id, $card_no = null) {
        //echo $id;exit;
        $mod = D('QrcodeproductView');
        $data = $mod->where('Exchange_qrcode.id=' . $id)->find();
        //print_r($data);exit;
        //==echo $mod->getLastSql();exit;
//        foreach ($data as $key => $value) {
//            //$str .= $value['title'].'×'.$value['num'] . '、';
//            $str .= $value['title'];//.'×'.$value['num']. '&nbsp,&nbsp';
//            $pids.= $value['pid'] . '&nbsp,&nbsp';
////            
//            
//        }
//      
        //__ROOT__/api.php/Qrcode?value={$url}&size=12
        //$this->assign($str)
        //  echo  $SALE+$NO_SALE;exit;

        if ($data['issale'] == 1 && $card_no) {

            $SALE = $data['p_score'] * getSaleByCardNo($card_no);
            $this->assign('score', $SALE);
        } else {

            $this->assign('score', $data['p_score']);
        }
        $this->assign('pid', $data['pid']);
        $this->assign('product', $data['title']);
        //  $this->assign('score', $SALE+$NO_SALE);
//        $this->assign('price', $data[0]['price']);
    }

    function getOrderInfo($where=array()) {
        $mod = M('Exchange_order');
       
        $where['openid'] = wx_openid();
       
        $orderinfo = $mod->where($where)->find(); //查询订单信息
       // echo $mod->getLastSql();exit;
        return $orderinfo;
    }

    function orderDetail($id) {
        $mod = M('Exchange_order');
        $data = $mod->where('id=' . $id)->find();
        $this->assign('data', $data);
        $this->assign('img', getWxBaseInfo($data['openid']));
    }

}

?>