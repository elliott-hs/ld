<?php
namespace Exchange\Model;
use Think\Model\ViewModel;
class QrcodeproductViewModel extends ViewModel {
    public $viewFields = array(
        'Exchange_qrcode' => array('*'),
        'Exchange_qrproduct' => array('*','_on'=>'Exchange_qrcode.id=Exchange_qrproduct.qid'),
        'Exchange_product' => array('id'=>'pid','title','issale','score'=>'p_score','_on'=>'Exchange_qrproduct.pid=Exchange_product.id'),

    );
}
?>