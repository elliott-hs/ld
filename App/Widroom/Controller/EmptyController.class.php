<?php
namespace Widroom\Controller;
use Think\Controller;
class EmptyController extends Controller {
	public function _initialize() {
		lvdi_widroom_logs();
	}
	public function index(){
		header("Content-Type:text/html; charset=utf-8");
		echo "智慧办公";
	}
	public function _empty(){
		$this->index();
	}
	 
}