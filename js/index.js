(function(){
	var box = document.getElementById('box'),
	    loadimg = document.getElementById('loadimg'), //添加图片按钮
	    canvas1 = document.getElementById('canvas1'), //左边canvas，放入原图
	    cxt1 = canvas1.getContext('2d'),
	    canvas2 = document.getElementById('canvas2'), //右边小图裁剪后的canvas
	    cxt2 = canvas2.getContext('2d'),
	    canvas3 = document.getElementById('canvas3'),//右边大图剪裁后的canvas
	    cxt3 = canvas3.getContext('2d'),
	    pop = document.getElementById('pop'), // 裁剪滑块
	    saveImg = document.getElementById('saveImg'),//确定按钮
	    msg = document.getElementById('msg'),//提示信息
	    biger = document.getElementById('biger'),//放大按钮
	    little = document.getElementById('little'); //缩小按钮
	var ct = document.getElementById('ct'),//遮罩层top部分
	    cl = document.getElementById('cl'),//遮罩层left部分
	    cr = document.getElementById('cr'),//遮罩层right部分
	    cb = document.getElementById('cb');//遮罩层bottom部分  
	//添加图片==
	loadimg.addEventListener('change',function(){
		change(this);
	});
	//拖拽图片进入canvas1中==
	document.addEventListener("dragover", function(e){
		e = e || event;
    	e.preventDefault();//取消默认打开图片
	});
	document.addEventListener("drop", function(e) {
		var e = e || event;
		e.preventDefault();
		var files = e.dataTransfer;
		change(files);	
	});
	//获取截图数据并写入canvas2和canvas3中==
	function getdata(){
		mask(pop);//遮罩==
		cxt2.clearRect(0,0,canvas2.width,canvas2.height);
		cxt3.clearRect(0,0,canvas3.width,canvas3.height);
		var popX = pop.offsetLeft,//裁剪区域距canvas1左边距离（注意：canvas1外层做了相对定位，所以不需要减去canvas1的左边距）
		    popY = pop.offsetTop,//同样
		    popW = pop.offsetWidth,
		    popH = pop.offsetHeight;    
	    /*获取图片截取部分的像素数据：坐标，宽高====这个方法不适合缩放，所以取消
		//var imgData = cxt1.getImageData(popX,popY,popW,popH);
		//把截图数据写入canvas2中
		//cxt2.putImageData(imgData,0,0);*/

		//=================使用canvas1作为获取截图的源========================
		//参数：1：图片源（注意这里是canvas1，而不是oImg），
		//      2：截图开始x坐标，3：截图开始y坐标，
		//      4：截图区域width，5：截图区域height，
		// ======以上几个参数是获取截图数据，以下几个参数是在另一个canvas上绘图======
		//      6：在canvas2上开始画图的起始坐标x，这里是0
		//      7：在canvas2上开始画图的起始坐标y，同样也是0
		//      8：要绘图的宽度，9：要绘图的高度（这里是满屏，所以以canvas2的宽高来画）
		cxt2.drawImage(canvas1, popX, popY, popW, popH, 0, 0, canvas2.width, canvas2.height);
		cxt3.drawImage(canvas1, popX, popY, popW, popH, 0, 0, canvas3.width, canvas3.height);
	}
	//遮罩====
	mask(pop);
	function mask(pop){
		var pl = pop.offsetLeft,
	    pt = pop.offsetTop,
	    pw = pop.offsetWidth,
	    ph = pop.offsetHeight;
		ct.style.height = pt+'px';
		cl.style.width = pl+'px';
		cl.style.height = cr.style.height = ph+'px';
		cl.style.top = cr.style.top = pt+'px';
		cr.style.width = canvas1.offsetWidth - pw - pl +"px";
		cb.style.height = canvas1.offsetHeight - ph - pt +'px';
	}	
	//提交截图的数据==
	saveImg.onclick = function(){
		var sendmsg = document.getElementById('sendmsg');
		var small_img = canvas2.toDataURL();//小图：得到的是base64位编码的图片数据
		var middle_img = canvas3.toDataURL();//中图
		//===提交数据代码省略====
		sendmsg.innerHTML = '请打开浏览器的console看base64编码的图片数据';
		setTimeout(function(){sendmsg.innerHTML = ''},5000);
		console.log(small_img,middle_img);
	}
	//添加图片==
	function change(obj){
		var maxExt = ['jpg','png','gif','bmp']; //允许图片类型
		var file = obj.files[0];		
	    //选择图片后============================
		if(file){//以防取消选择图片时报错
			var fileSize = file.size; //文件大小KB
			var fileName = file.name; //获取文件名
			var fileExt = fileName.substr(fileName.lastIndexOf(".")).toLowerCase().replace('.','');//获取文件的扩展名 如：png
			//判断图片文件格式==
			if(maxExt.indexOf(fileExt)<0){
				msg.innerHTML = '提示：请选择 jpg/png/gif/bmp 格式图片文件';
				setTimeout(function(){msg.innerHTML=''},3000);
				return false;
			}
			//加载图片处理
			var readFile = new FileReader();
			readFile.readAsDataURL(file); // 进行读取操作。当图像文件加载完成后,会转换成一个data:URL,传递到onload回调函数中
			readFile.onload = function (ev) { //当读取操作成功完成时调用.		
			  	var oImg = new Image();
			  	oImg.src = ev.target.result;//获取64位的图片信息，作为src路径
			  	oImg.onload = function(){
			  		//图片尺寸宽高都小于canvas时，按图片自身宽高显示，
			  		//图片超出canvas时，按比例充满canvas容器
			  		var w = oImg.width; //图片宽度
				  	var h = oImg.height;//图片高度
				  	var cw,ch;
				  	if(w>canvas1.width || h>canvas1.height){
				  		if(w/h>=canvas1.width/canvas1.height){
				  			ch = canvas1.height;
				  			cw = canvas1.height*w/h;
				  		}else{
				  			cw = canvas1.width;
				  			ch = canvas1.width*h/w;
				  		}
				  	}else{
				  		cw = w;
				  		ch = h;
				  	}
				  	cxt1.clearRect(0,0,canvas1.width,canvas1.height);
				  	//参数：图片对象，从x、y起点坐标开始画，图片的宽高
			  		cxt1.drawImage(this,0,0,cw,ch); //原始画布加载图片			  				  		
			  		getdata();//把截图数据写入到canvas2中===			  		
			        //移动pop动态获取数据
			  		pop.onmousedown = function(e){
			  			var e = e || window.event,
			  			    x0 = e.clientX,
			  			    y0 = e.clientY,
			  			    px = pop.offsetLeft,
			  			    py = pop.offsetTop;
			  			document.onmousemove = function(e){
			  				var e = e || window.event,
			  				    mX = e.clientX-x0+px,
			  				    mY = e.clientY-y0+py;
			  				//控制剪裁区域滑块在canvas范围内移动
			  				if(mX<0)mX=0;
			  				if(mX>canvas1.width-pop.offsetWidth){mX=canvas1.width-pop.offsetWidth};
			  				if(mY<0)mY=0;
			  				if(mY>canvas1.height-pop.offsetHeight){mY=canvas1.height-pop.offsetHeight};
			  				//设置滑块移动位置
			  				pop.style.left = mX +'px';
			  				pop.style.top = mY + 'px';
			  				getdata();//把截图数据写入到canvas2中===
			  				return false;
			  			}
			  			document.onmouseup = function(){
			  				this.onmousemove = null;
			  				this.onmouseup = null;
			  			}
			  		}
			  		//放大0.1倍
			  		var fw = cw,
			  		    fh = ch;
			  		var flag = false,//移动图片时，当鼠标抬起时变true
					    a = 0,//记录移动前的x坐标
					    b = 0,//记录移动前的y坐标
					    j = 0,//记录即时x坐标
					    k = 0;//记录即时y坐标
					function scale(g){
						var step = g/100;
						(function p(){
							cxt1.clearRect(0,0,canvas1.width,canvas1.height);
							cxt1.drawImage(oImg,0,0,fw*(1+step),fh*(1+step));
							step += step;
							if(Math.abs(step)<=0.1){
								window.requestAnimationFrame(p);
							}
						})()
					}
					biger.onclick = function(){
						scale(1);
						fw = fw*1.1;
						fh = fh*1.1;
						j = 0;
						k = 0;
						getdata();//把截图数据写入到canvas2中===
					}
					//缩小0.1倍
					little.onclick = function(){
						scale(-1);
						fw = fw*0.9;
						fh = fh*0.9;
						j = 0;
						k = 0;
						getdata();//把截图数据写入到canvas2中===
					}
					//在遮罩层上滑动鼠标触发移动图片
					ct.onmousedown = function(e){
						moveimg(e,fw,fh);
					}
					cl.onmousedown = function(e){
						moveimg(e,fw,fh);
					}
					cr.onmousedown = function(e){
						moveimg(e,fw,fh);
					}
					cb.onmousedown = function(e){
						moveimg(e,fw,fh);
					}
					//当鼠标在遮罩层上滑动canvas1中的源图片
					//注意：canvas元素动画不是在原来的位置上移动，而是重绘的过程
					//所以，要设置变量来寄存移动后坐标值，然后再重绘
					function moveimg(e,fw,fh){ //fw,fh是缩放后的宽高（之前有可能操作过缩放）
						var e = e || event,
						    x0 = e.clientX,
						    y0 = e.clientY;
						document.onmousemove = function(e){
							if(flag){
								a=j;
								b=k;
								flag = false;
							}
							var e = e || event,
							    x1 = e.clientX,
							    y1 = e.clientY,
							    mx = x1-x0+a,
							    my = y1-y0+b;
							cxt1.clearRect(0,0,canvas1.width,canvas1.height);
							cxt1.drawImage(oImg,mx,my,fw,fh);
							j = mx;
							k = my;
							getdata();
							return false;
						}
						document.onmouseup = function(){
							flag = true;
							this.onmousemove = null;
							this.onmouseup = null;
						}
					}
			  	}
		    }
		}
	}
})();