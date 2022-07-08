const util = (()=>{
  const realType = (val)=>{
    return Object.prototype.toString.call(val)
  }
  // HTMLElement.prototype.loading = (state)=>{
  //   alert("loading")
  // }
  Date.prototype.format = function(fmt){   
    var o = {   
      "M+" : this.getMonth()+1,                 //月份   
      "d+" : this.getDate(),                    //日   
      "h+" : this.getHours(),                   //小时   
      "m+" : this.getMinutes(),                 //分   
      "s+" : this.getSeconds(),                 //秒   
      "q+" : Math.floor((this.getMonth()+3)/3), //季度   
      "S"  : this.getMilliseconds()             //毫秒   
    };   
    if(/(y+)/.test(fmt))   
      fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
    for(var k in o)   
      if(new RegExp("("+ k +")").test(fmt))   
    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
    return fmt;   
  }    
  let toastList = [],
      isDarkMode =  window.matchMedia('(prefers-color-scheme: dark)').matches;

  //全局toast栈
  return {
    isDarkMode,
    realType(val){
      return Object.prototype.toString.call(val)
    },
    //创建dom，传入有效的html字符串，返回fragment
    createDom(str){
      let div = document.createElement("div")
      div.innerHTML  = str
      let children = div.childNodes
      if(children.length<=1){
        return children[0]||null
      }else{
        let f = document.createDocumentFragment();
        while(children.length){
          f.appendChild(children[0])
        }
        return f
      }
    },
    //处理预览图路径，默认方形200x200
    resolvePreview(url,width=200,height=200){
      let str = `_${width}x${height}`
      let replace = url.replace(/(.*\/)*([^.]+).*/ig,"$2")
      return url.replace(replace,replace+str)
    },
    isNaN(val){
      return Number.isNaN(val)
    },
    isNull(val){
      return realType(val)==="[object Null]"
    },
    isString(val){
      return realType(val)==="[object String]"
    },
    isArray(val){
      return realType(val)==="[object Array]"
    },
    //校验表单
    valid(selector){
      let valid = true
      let inputs = document.querySelector(selector).querySelectorAll(".form-control[name]")
      inputs.forEach(input=>{
        input.classList.remove("invalid")
        let value = input.value
        if(util.isString(value)){
          value = value.trim()
        }
        if(input.getAttribute("required")=="required"){
          if(value===""||value===null||value===undefined){
            input.classList.add("invalid")
            valid = false 
          }
        }
        if(input.getAttribute("data-pattern")){
          if(!new RegExp(input.getAttribute("data-pattern")).test(value)){
            input.classList.add("invalid")
            valid = false
          }
        }
      })
      return valid
    },   
    //全局toast 
    toast(content,options={duration:3000}){
      let t = {
        el:util.createDom(`<div class="toast-item">${content}</div>`),
        height:0,
        bottom:0
      }
      let top = 10
      if(options.type){
        t.el.classList.add({"error":"toast-danger","success":"toast-primary"}[options.type])
      }
      if(toastList.length){
        top = document.querySelector(".toast-item:last-of-type").getBoundingClientRect().bottom+10
      }
      t.el.style.top = top+"px"
      toastList.push(t)
      document.body.appendChild(t.el)
      t.height = t.el.offsetHeight    
      setTimeout(()=>{
        t.el.classList.add('fade-out')
        setTimeout(()=>{
          t.el.remove()
        },200)
        toastList.splice(0,1)
        toastList.forEach(item=>{
          item.el.style.top = (parseInt(item.el.style.top,10) - t.height - 10)+"px"
        })   
      },3000)


    },
    confirm(content,options={fitEl:false}){
      let node = util.createDom(`<div class="confirm-container"> <div class="confirm-content">  <p class="confirm-text">${content}</p><div class="confirm-control"><button class="button button-confirm">确认</button><button class="button button-default button-cancel">取消</button></div></div></div></div>`)
      if(options.type){
        node.classList.add({"error":"toast-danger","success":"toast-primary"}[options.type])
      }
      let pr = new Promise((resolve,reject)=>{
        node.querySelector(".button-cancel").addEventListener("click",()=>{
          node.classList.remove("show")
          setTimeout(()=>{
            node.remove()
          },200)
          resolve(false)
        })
        node.querySelector(".button-confirm").addEventListener("click",()=>{
          node.classList.remove("show")
          setTimeout(()=>{
            node.remove()
          },200)          
          resolve(true)
        })      
      })
      if(options.fitEl){
        let content = node.querySelector(".confirm-content")
        content.style.position = "absolute"
        let bouding = options.fitEl.getBoundingClientRect()

        if(document.body.clientWidth - bouding.right -5 > 200){
          content.style.left = (bouding.right+5)+"px"
        }else if(bouding.left -5 > 200){
          content.style.left = (bouding.left - 200 - 5)+"px"
        }
        content.style.top = (bouding.top)+"px"
      }
      document.body.appendChild(node)
      setTimeout(()=>{
        node.classList.add("show")
      },0)      

      return pr
    },   
    lazyLoad(){
      let images = document.querySelectorAll("img.lazy")
      if(images.length){
        images.forEach(img=>{
          let imageObject = new Image(),
              src = img.dataset.src
          imageObject.src = src
          imageObject.onload = ()=>{
            img.src = src
            img.classList.remove("lazy")
          }
        })
      }
    }, 
    getImageColorSchema(src,callback){

      var img = document.createElement("img");
      img.src = src;
      img.crossOrigin = "anonymous"
      img.style.display = "none";
      document.body.appendChild(img);
    
      img.onload = function() {
          var c = document.createElement("canvas");
          c.width = img.width
          c.height = img.height
          var ctx = c.getContext("2d"); 
          //getContext("2d") 对象是内建的 HTML5 对象，
          //拥有多种绘制路径、矩形、圆形、字符以及添加图像的方法。
          
          ctx.drawImage(img, 0, 0, c.width, c.height); 
          //把图片画入画布(图片节点，左上角开始的x,y, 画入图片的宽，高)
      
          var imgData = ctx.getImageData(0, 0, c.width, c.height);
           //getImageDate 得到画布里的图片信息(画布的四个角)
      
          // console.log(imgData) //看一下取出来的数据对象！
      
          // 取所有像素的平均值
          let r = 0;
          let g = 0;
          let b = 0;
          let a = 0;
          for (let row = 0; row < c.height; row++) {
              for (let col = 0; col < c.width; col++) {
                  r += imgData.data[((c.width * row) + col) * 4];
                  g += imgData.data[((c.width * row) + col) * 4 + 1];
                  b += imgData.data[((c.width * row) + col) * 4 + 2];
                  a += imgData.data[((c.width * row) + col) * 4 + 3];
              }
          }
      
          // 求取平均值
          r /= (c.width * c.height);
          g /= (c.width * c.height);
          b /= (c.width * c.height);
          a /= (c.width * c.height);
      
          // 将最终的值取整
          r = Math.round(r);
          g = Math.round(g);
          b = Math.round(b);
          a = Math.round(a);
      
          let rgba = {
              r,
              g,
              b,
              a,
          }
          callback(rgba)
          img.remove()
      }      

    },
    getImageBrightness(src,callback) {
      var img = document.createElement("img");
      img.src = src;
      img.crossOrigin = "anonymous"
      img.style.display = "none";
      document.body.appendChild(img);
    
      var colorSum = 0;
    
      img.onload = function() {
          var canvas = document.createElement("canvas");
          canvas.width = this.width;
          canvas.height = this.height;
    
          var ctx = canvas.getContext("2d");
          ctx.drawImage(this,0,0);
    
          var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
          var data = imageData.data;
          var r,g,b,avg;
    
          for(var x = 0, len = data.length; x < len; x+=4) {
              r = data[x];
              g = data[x+1];
              b = data[x+2];
    
              avg = Math.floor((r+g+b)/3);
              colorSum += avg;
          }
          var brightness = Math.floor(colorSum / (this.width*this.height));
          callback(brightness)
          img.remove()

      }
    },    
    clearTimeout(tm){
      tm.forEach(item=>{
        clearTimeout(item)
      })
    }
  }
})()
window.util = util
export default util