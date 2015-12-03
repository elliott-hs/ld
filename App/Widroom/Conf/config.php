<?php
return array(
	//'SESSION_AUTO_START' => true,
    	//'SESSION_OPTIONS' => array('path' => './SessionData/', 'prefix' => 'lvdi'),
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
	),
	'DATA_CACHE_TYPE'=>'redis',
	'REDIS_HOST'=>'127.0.0.1',
	'REDIS_PORT'=>6379,
	'REDIS_TIMEOUT'=>'300',//超时时间
 	'REDIS_PERSISTENT'=>false,//是否长连接 false=短连接
	'REDIS_AUTH'=>'',//AUTH认证密码
	
);