import util from "./util.js"
var PREVIEW = (()=>{
  let dom = util.createDom(`<div class="full-preview-container">
    <div class="full-preview-close"></div><div class="full-preview-list"> <img></div><div class="full-preview-indicator"></div>`);
  let imgListDom = dom.querySelector(".full-preview-list")
  let imgIndicatorDom = dom.querySelector(".full-preview-indicator")
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
  var fns = {
    closePreview:()=>{
      dom.classList.remove("show")
      setTimeout(()=>{
        dom.remove()
        imgIndicatorDom.innerHTML = ""
        // imgListDom.querySelector("img").src = ""
      },200)
    },
    loadImage:(el,src)=>{
      let img = new Image()
      let timer = null
      img.addEventListener('load', function() {
        if(timer) clearTimeout(timer)
        dom.classList.remove("loading")
        el.src = src
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
    previewImages:(imgs,index)=>{
      imgListDom.querySelector("img").src = imgs[index].thumb
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
          fns.loadImage(imgListDom.querySelector("img"),item.url)
        })
        imgIndicatorDom.appendChild(indicator)
      })
      fns.loadImage(imgListDom.querySelector("img"),imgs[index].url)
      document.body.appendChild(dom)
      setTimeout(()=>{
        dom.classList.add("show")
      },0)
    }
  }
  return fns
})()
export default PREVIEW