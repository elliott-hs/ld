<?php

namespace Exchange\Controller;

use Think\Controller;

class JiyueduController extends Controller {

    function index() {
        $id = intval($_REQUEST['id']);
        $openid = wx_openid();
        $huiyuan = check_vip($openid);
        $person_m = M('jiyuedu_person');
        $click_m = M('jiyuedu_click');
        $person = $person_m->where('id=' . $id)->find(); //查询阅读数量
        $where['openid'] = $openid;
        $where['pid'] = $id;
        $clickrs = $click_m->where($where)->find(); //检测是否点击过
        //TODO
        //
        //更新阅读数
        if ($id && $openid) {
            $arr['num'] = $person['num'] + 1;
            //更新阅读数条件
            if (!$clickrs && $openid != $person['openid']) {
                //更新个人阅读书
                $person_m->where('id=' . $id)->save($arr);
            }
            $click_m->add(array('openid' => $openid, 'pid' => $id, 'ctime' => getSysTime())); //添加点击记录
        }

        $map['openid'] = $openid;
        $info = $person_m->where($map)->find();
        $shareid = '';
        if ($huiyuan) {
            if (!$info) {
                $id = $person_m->add(array('openid' => $openid, 'ctime' => getSysTime()));
            }
            $str = $info['id'] ? $info['id'] : $id;
            $shareid = '?id=' . $str;
        }

        $arr = array(
            "title" => "点开我，帮TA集满5个阅读数。", //转发标题
            "desc" => "感“蟹”有你，1元兑换螃蟹，感恩回馈会员。", //转发内容
            "link" => 'http://a.forcent.cn/ldh/exchange.php/Jiyuedu' . $shareid,
            "imgUrl" => C('IMG_PATH') . 'uploads/px.jpg',
            'id' => $str
        );

        $gc = M('jiyuedu_order');
        $this->assign('tid1', $gc->where(array('openid' => $openid, 'tid' => 1))->find()); //查询积分兑换信息
        $this->assign('tid2', $gc->where(array('openid' => $openid, 'tid' => 2))->find()); //集阅读兑换信息
        $this->assign('num', $info['num']);
        $this->assign('huiyuan', $huiyuan);
        $this->assign('sharePackage', json_encode($arr));
        
        $this->assign('signPackage', $this->signPackage());
        $this->assign('openid', $openid);
        $this->assign('id', $id);
        $this->display();
    }

    
    function signPackage(){
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
        $url = "$protocol$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
        return file_get_contents('http://a.forcent.cn/ldh/api.php/Wechatapi/signPackage?url='.$url);
    }
    //异步检测会员
    function checkvip() {
        $openid = $_REQUEST['openid'];
        $rs = check_vip($openid);
        if ($rs) {
            $json['status'] = 1;
        } else {
            $redirec_url = "http://a.forcent.cn/ldh/exchange.php/Jiyuedu";
            $url = checkFans($openid, $redirec_url, 1);
            $json['status'] = 0;
            $json['info'] = $url;
        }
        $this->ajaxReturn($json);
    }

    /**
     * 兑换
     * 
     */
    function exchange() {
        $json['status'] = 0;
        $tid = $_REQUEST['tid'];
        $openid = $_REQUEST['openid'];
        $gc = M('jiyuedu_order');
        $huiyuan = check_vip($openid);
        $score = getCredits($huiyuan['card_no']);
        if (1 == $tid && $score < 100) {
            $json['status'] = 0;
            $json['info'] = "积分不足";
            echo json_encode($json);
            exit;
        }

        $arr = array(
            //'id' => substr(strrev($huiyuan['card_no']), 0, 1) . date('s'),
            'tid' => $tid,
            'tel' => $huiyuan['huiyuan_tel'],
            'name' => $huiyuan['huiyuan_name'],
            'openid' => $openid,
            'ctime' => getSysTime(),
        );
        $state = $gc->add($arr);
        if ($state) {
            if ($tid == 1) {
                deductCredits($huiyuan['card_no'], 100); //扣除积分
                $scorearr = array(
                    'qid' => '00001',
                    'orderid' => $state,
                    'score' => 100,
                    'huiyuanopenid' => $openid,
                    'huiyuantel' => $huiyuan['huiyuan_tel'],
                    'ctime' => getSysTime(),
                );
                M('score_scorelog')->add($scorearr); //记录扣除积分日志
            }
            $person_m = M('jiyuedu_person');
            if ($tid == 2) {
                $person_m->where(array('openid' => $openid))->save(array('num' => 0)); //清空阅读数
                //TODO
            }
            $json['status'] = 1;
            $json['key'] = $state;
            $json['info'] = "兑换成功";
        } else {
            $json['info'] = "兑换失败";
        }
        echo json_encode($json);
    }

    /**
     * 核销兑换信息
     * 
     */
    function jydorder() {
        $this->display('order');
    }

    //查询兑奖码
    function getOrderByKey() {
        $gc = M('jiyuedu_order');
        $key = intval($_REQUEST['key']);
        $where['id'] = $key;
        $rs = $gc->where($where)->find();
        //echo $gc->getLastSql();exit;
        if ($rs) {
            $rs['img'] = getWxBaseInfo($rs['openid']);
            $json['status'] = 1;
            $json['info'] = $rs;
        } else {
            $json['status'] = 0;
            $json['info'] = "key不存在";
        }
        $this->ajaxReturn($json);
    }

    //更新兑奖订单信息
    function updatestatus() {
        $gc = M('jiyuedu_order');
        $key = $_REQUEST['key'];
        $where['id'] = $key;
        $rs = $gc->where($where)->save(array('status' => 2));
        if ($rs) {
            $json['status'] = 1;
            $json['info'] = "兑换成功";
        } else {
            $json['status'] = 0;
            $json['info'] = "兑换失败";
        }
        $this->ajaxReturn($json);
    }

    //分项计量
    function sharelog() {
        $arr = array(
            'open_id' => $_REQUEST['openid'],
            'activity_id' => 'px',
            'ctime' => time(),
            'utime' => time(),
        );
        M('sharelog')->add($arr);
    }

}
