<?php
return array(
            //'SESSION_AUTO_START' => true,
            //'SESSION_OPTIONS' => array('path' => './SessionData/', 'prefix' => 'lvdi'),	 
	/* 模板相关配置 */
	'TMPL_PARSE_STRING' => array(
		'__IMG__'    => __ROOT__ . '/Public/' . MODULE_NAME . '/images',
		'__JS__'     => __ROOT__ . '/Public/' . MODULE_NAME . '/js',
		'__CSS__'     => __ROOT__ . '/Public/' . MODULE_NAME . '/css'
	)
);