/*===============================================================
***************************************************************
*-*           author:�����ķ�  qq:17391193                  *-*

//////////////////////////////////
ͼƬԤ����/
//////////////////////////////////

****************************************************************/
$.fn.imagesLoaded = function( callback ){
  var elems = this.find( 'img' ),
      elems_src = [],
      self = this,
      len = elems.length;
 
  if ( !elems.length ) {
    callback.call( this );
    return this;
  }
 
  elems.one('load error', function() {
    if ( --len === 0 ) {
      // Rinse and repeat.
      len = elems.length;
      elems.one( 'load error', function() {
        if ( --len === 0 ) {
          callback.call( self );
        }
      }).each(function() {
        this.src = elems_src.shift();
      });
    }
  }).each(function() {
    elems_src.push( this.src );
    // webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
    // data uri bypasses webkit log warning (thx doug jones)
    this.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  });
 	
  return this;
};

//perload
$.fn.preload_images = function(options,callback) {
	options = $.extend({
		src : ""
	},options);
	var _self = this;
	var img = new Image();
	$(img).load(function(){
		_self.attr("src", options.src);
		//ִ�лص�����
		callback.call(options.src)
	}).attr("src", options.src);
	
	return _self;
}



//ͼƬ��Ԥ����
//����sources:ͼƬ��Ϣ��������
//����callback:�ص���������ͼƬԤ������ɺ�����ִ�д˺�����
var loadImages=function(sources, callback){
	
    var count = 0,//ͼƬ����
		images ={},//ͼƬLIST
        imgNum = 0;//ͼƬ����
	
	//��ȡͼƬ��ͼ
    for(src in sources){
        imgNum++;
    }
	//images loader
    for(src in sources){
        images[src] = new Image();//����һ��Image����ʵ��ͼƬ��Ԥ����
        images[src].onload = function(){
			//alert('img���¼��أ�'+count);
            if(++count >= imgNum){
                callback.call(images);//ִ�лص�����
            }
			//var pro=Math.floor((100/imgNum*(count)));
			//$(".progress").html('Loading��'+pro+"%");
        }
        images[src].src = sources[src];//ͼƬ����·��
    }
} 