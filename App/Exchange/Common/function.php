<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function getwxsid() {
    return session('_wxsid');
}

function getwxuserid() {
    return session('_wxuserid');
}

function mobile_asterisk($mobile) {
    return substr_replace($mobile, '****', 3, 4);
}

//根据openid 获取用户基本信息
function getWxBaseInfo($openid) {
    $url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' . wx_access_token() . '&openid=' . $openid . '&lang=zh_CN';
    $arr = json_decode(http_get($url), true);
    return $arr['headimgurl'];
}

//扣积分
function updateScoreById($id) {
    $mod = M('Score_order');
    $info = $mod->where('id=' . $id)->find();
    deductCredits($info['card_no'], $info['score']);
}


