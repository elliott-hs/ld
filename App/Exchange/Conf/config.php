<?php
$config       = include './gc_config.php';
$api_config = array(
        'List_Len' => 20,
        'static_path' => __ROOT__.'/App/Exchange/Static/',
        'title'=>'积分兑换',
);
return array_merge($config, $api_config);