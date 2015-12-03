<?php
//智慧系统接口调用日志记录
function lvdi_widroom_logs(){
	$data = array('controller_name'=>CONTROLLER_NAME,'action_name'=>ACTION_NAME,'ip'=>get_client_ip());
	M("lvdi_widroom_logs")->add($data);	 
}
?>