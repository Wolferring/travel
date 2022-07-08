import util from "./util.js"
var PREVIEW = (()=>{
  let CURRENT_IMAGE_INDEX = 0
  let dom = util.createDom(`<div class="full-preview-container">
    <div class="full-preview-close"></div><div class="full-preview-list"> <img><div class="preview-next"></div><div class="preview-prev"></div></div><div class="full-preview-indicator"></div>`);
  let imgListDom = dom.querySelector(".full-preview-list")
  let imgIndicatorDom = dom.querySelector(".full-preview-indicator"),
      imgIndicatorList = [];
  dom.addEventListener("click",(e)=>{
    if(e.target==dom){
      fns.closePreview()
    }
  })
  dom.addEventListener("gesturestart",(e)=>{
    e.preventDefault()
  })      
  dom.querySelector(".full-preview-close").addEventListener("click",()=>{
    fns.closePreview()
  })
  dom.querySelector(".preview-next").addEventListener("click",()=>{
    fns.nextImage()
  })
  dom.querySelector(".preview-prev").addEventListener("click",()=>{
    fns.prevImage()
  })    
  var fns = {
    closePreview(){
      const keyDownHandler = this.previewKeyDown
      dom.classList.remove("show")
      imgIndicatorList = []
      CURRENT_IMAGE_INDEX = 0
      setTimeout(()=>{
        document.body.removeEventListener("keyup",keyDownHandler)
        dom.remove()
        imgIndicatorDom.innerHTML = ""
        document.body.classList.remove("preview-show")
        dom.style.backgroundColor = 'rgba(0,0,0,0.7)'
        imgListDom.querySelector("img").style.boxShadow = "none"
      },200)
    },
    loadImage(el,image){
      let src = image.url
      let thumb = image.thumb
      el.style.boxShadow = "none"
      let img = new Image()
      let timer = null
      img.addEventListener('load', function() {
        if(timer) clearTimeout(timer)
        dom.classList.remove("loading")
        el.src = src
        util.getImageColorSchema(thumb,(e)=>{
          dom.style.backgroundColor = `rgba(${e.r},${e.g},${e.b},0.7)`
          el.style.boxShadow = `0px 0px 20px 5px rgb(${e.r} ${e.g} ${e.b} /70%),
                                0px 0px 30px 5px rgb(${e.r},${e.g},${e.b}),
                                0px 0px 50px 8px rgb(${e.r} ${e.g} ${e.b} /50%),
                                0px 0px 80px 10px rgb(${e.r} ${e.g} ${e.b} /30%)`
        })
      }, false)
      img.addEventListener('error', function() {
        if(timer) clearTimeout(timer)
        dom.classList.remove("loading")
        util.toast("图片加载失败",{
          type:"error"
        })
      }, false)          
      img.src = src    
      timer = setTimeout(()=>{
        dom.classList.add("loading")
      },100)

    },
    previewKeyDown(e){
      let key = e.keyCode
      switch(key){
        case 39:
          //右
          fns.nextImage()
          break;
        case 37:
          fns.prevImage()
          break;
        case 27:
          fns.closePreview()
          break;
          //esc
      }
    },
    prevImage(){
      if(imgIndicatorList.length<=0) return;
      if(CURRENT_IMAGE_INDEX == 0){
        CURRENT_IMAGE_INDEX = imgIndicatorList.length
      }
      imgIndicatorList[CURRENT_IMAGE_INDEX-1]['indicator'].click()
    },    
    nextImage(){
      if(imgIndicatorList.length<=0) return;
      if(CURRENT_IMAGE_INDEX+1==imgIndicatorList.length){
        CURRENT_IMAGE_INDEX = -1
      }
      imgIndicatorList[CURRENT_IMAGE_INDEX+1]['indicator'].click()
    },
    previewImages(imgs,index){
      const keyDownHandler = this.previewKeyDown

      imgListDom.querySelector("img").src = imgs[index].thumb
      fns.loadImage(imgListDom.querySelector("img"),imgs[index])
      CURRENT_IMAGE_INDEX = index
      
      imgs.forEach((item,which)=>{
        let indicator = util.createDom(`<div class="preview-indicator ${which==index?"active":""}"><img src="${item.thumb}" alt=""></div>`)

        indicator.addEventListener("click",()=>{
          imgIndicatorDom
            .querySelector(".preview-indicator.active")
            .classList
            .remove("active")
          indicator
            .classList
            .add("active")
          fns.loadImage(imgListDom.querySelector("img"),item)
          CURRENT_IMAGE_INDEX = which
        })
        imgIndicatorDom.appendChild(indicator)
        imgIndicatorList.push({
          index:which,
          url:item.url,
          thumb:item.thumb,
          indicator:indicator
        })

      })
      document.body.appendChild(dom)
      setTimeout(()=>{
        dom.classList.add("show")
        document.body.classList.add("preview-show")
        document.body.addEventListener("keyup",keyDownHandler)
      },0)
    }
  }
  return fns
})()
export default PREVIEW