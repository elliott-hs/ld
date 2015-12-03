var myScrol = null;
var imgHeight = 0;
function initAnimationPage(){
	var pagew = document.documentElement.clientWidth,
		pageh = document.documentElement.clientHeight;
	
	var cw = pagew;
	var ch = pageh;//parseInt(pagew * 1136 / 640);
	$('#page_container').css('width',cw + 'px');
	$('#page_container').css('height',ch + 'px');
	
	$('#page_slider').css('width',cw * 4 + 'px');
	//$('#page_slider').css('height',ch + 'px');
	
	$('.item').css('width',cw + 'px');
	
	
	imgHeight = parseInt(cw * 91 / 640);
	
	var preIndex = 0;
	myScroll = new iScroll('page_container', { scrollX: true,hScrollbar:false,vScrollbar:false, bounce:false, freeScroll: true, snap: true, snapThreshold:50, checkDOMChanges: true, momentum: false, 
		onScrollEnd: function(){
			var index = myScroll.currPageX;
			if(preIndex != index){
				$('.wenzi').css('-webkit-transition-duration','0ms');
				$('.wenzi').css('height','0px')
				setTimeout(function(){
					$('.wenzi').css('-webkit-transition-duration','2100ms');
					if(index == 0){
						$('#img1_1').css('height',imgHeight + 'px');
						$('#img1_2').css('height',imgHeight + 'px');
					}else if(index == 1){
						$('#img2_1').css('height',imgHeight + 'px');
						$('#img2_2').css('height',imgHeight + 'px');
					}else if(index == 2){
						$('#img3_1').css('height',imgHeight + 'px');
						$('#img3_2').css('height',imgHeight + 'px');
					}
				}, 10);
			}
			if(index == 3){
				top.animationEnd();
				$('#page_container').remove();
			}
			
			preIndex = index;
			
		},
		onScrollMove: function(){
			 playOrPause(true);
		}
		});
	
	setTimeout(function(){
		$('#img1_1').css('height',imgHeight + 'px');
		$('#img1_2').css('height',imgHeight + 'px');
	}, 1800);
	
	var img = new Image();
	img.onload = function(){
		var w = img.width;
		var h = img.height;
		$('#page_slider').css('height',pagew * h/w + 'px');
		//
		$('#img1_1').css('margin-top', parseInt(pagew * h/w/3) + 'px');
		$('#img2_1').css('margin-top', parseInt(pagew * h/w/3) + 'px');
		$('#img3_1').css('margin-top', parseInt(pagew * h/w/3) + 'px');
	};
	img.src = 'page1/img1.jpg';
	
} 

 