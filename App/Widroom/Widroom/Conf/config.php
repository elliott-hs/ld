<?php
return array(
	//'配置项'=>'配置值'
	/* 数据库配置 */
	'DB_TYPE'   => 'mysql', // 数据库类型
	
	'DB_HOST'   => '117.135.143.107', // 服务器地址
	'DB_NAME'   => 'lvdi_ihuiyuan', // 数据库名
	'DB_USER'   => 'ld',  //用户名
	'DB_PWD'    => 'ld@2015OK',  // 密码
	'DB_PORT'   => '3306', // 端口
	'DB_PREFIX' => '', // 数据库表前缀 绿地_
	'SHOW_PAGE_TRACE' =>false,

	//消息模板
	'WX' =>array(
		'SEND_TMP_ID' =>'warx7VZclcDl6BLTHuRVYFOh9JM95LG6xHMdhAP_Mns',
		'SEND_TMP_URL'=>'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token='
	),
	'POINT_URL'=>array(
		'car'=>'',
		'DOOR'=>'http://tomcat.massky.cn/WeChatNanJing/accessOwner',
		'ELEVATOR'=>'http://tomcat.massky.cn/WeChatNanJing/accessOwner',
		'PRINTER'=>''
	),
	/* 模板相关配置 */
	'TMPL_PARSE_STRING' => array(
		'__IMG__'    => __ROOT__ . '/Public/' . MODULE_NAME . '/images',
		'__JS__'     => __ROOT__ . '/Public/' . MODULE_NAME . '/js',
		'__CSS__'     => __ROOT__ . '/Public/' . MODULE_NAME . '/css'
	)
	
 
);