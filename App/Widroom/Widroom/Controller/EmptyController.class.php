<?php
namespace Widroom\Controller;
use Think\Controller;
class EmptyController extends Controller {
    public function index(){
        header("Content-Type:text/html; charset=utf-8");
        echo "智慧办公API V1.0";
    }
    public function _empty(){
        $this->index();
    }
}