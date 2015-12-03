<?php

namespace Exchange\Controller;

use Think\Controller;

class IndexController extends Controller {

    function index() {
        if (!session('_wxuserid')) {
            $this->display('login');
        } else {
            redirect('/ldh/exchange.php/Store/productList?sid='.getwxsid());
        }
    }

    /**
     * 异步检测登录
     * 
     */
    public function checkLogin() {
        $gc = M('Exchange_storeuser');
        $name = $_REQUEST['name'];
        $pwd = $_REQUEST['pwd'];
        $map['name'] = $name;
        $map['state'] = 1;
        $userTure = $gc->where($map)->find();
        $data['status'] = 0;
        if (!$userTure) {
            $data['info'] = "无效账号";
        } elseif ($userTure['pwd'] != $pwd) {
            $data['info'] = "密码错误";
        } elseif ($userTure['state'] != 1) {
            $data['info'] = "账号异常";
        } else {
            session('_wxuserid', $userTure['id']);
            session('_wxsid', $userTure['sid']);
            $arr['ip'] = getcip();
            $arr['logintime'] = date('Y-m-d H:i:s');
            $gc->where('id='.$userTure['id'])->save($arr);//更新登陆信息
            $data['data'] = $userTure['sid'];
            $data['info'] = "登录成功";
            $data['status'] = 1;
        }
        $this->ajaxReturn($data);
    }

}
