<?php
return array(
	/* 数据库配置 */
	'DB_TYPE'   => 'mysql', // 数据库类型
	'DB_HOST'   => '127.0.0.1', // 服务器地址
	'DB_NAME'   => 'lvdi_ihuiyuan', // 数据库名
	'DB_USER'   => 'root',  //用户名
	'DB_PWD'    => "",  // 密码
	'DB_PORT'   => '3306', // 端口
	'DB_PREFIX' => '', // 数据库表前缀 绿地_
	//微信配置
	'weixin'  => array(
			'token'  =>  'jslvd', //填写你设定的key
			'appid'  =>  'wx30ec9e811ab3a870', //填写高级调用功能的app id,
			'appsecret'   =>  '8a63d9309d6013081715e032ef75f89f', //密钥
	),
	'weixin2'  => array(
			'token'  =>  'omJNpZEhZeHj1ZxFECKkP48B5VFbk1HP', //填写你设定的key
			'appId'  =>  'wx1a27b8246227cd4b', //填写高级调用功能的app id,
			'appSecret'   =>  '76992b2ce6e0f7f57ff092f4f9ffcfb6', //密钥
	)
	
); 
