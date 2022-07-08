import "./styles/user.less"
import {GLOBAL_EVENT} from "./event.js"
import util from "./util.js"
import auth from "./auth.js"
import PREVIEW from "./preview"
// import Upload from "./upload.js"
import api from './fetch.js'
import domtoimage from 'dom-to-image';
var avatarSuccess = function(res){
  document.querySelector(".avatar-image").src = res.url
  api.updateUser({
    avatar:res.real_url
  })
  .then(res=>{
    util.toast("修改头像成功",{
      type:"success"
    })
  })

}
// const upload = new Upload("#avatar-upload",{
//   multiple:false,
//   maxSize:2*1024,
//   success:avatarSuccess
// })

const userLoader = {
  refresh(){
    let render = this.render
    auth.refresh()
    .then(()=>{
      render()
    })   
    // api.getOneWord()   
    // .then(res=>{

    //   if(res.data.code==200){
    //     let url = res.data.newslist[0].imgurl
    //     util.getImageBrightness(url,(e)=>{
    //       document.querySelector(".user-cover-image").src = url
    //       if(e<110){
    //         document.querySelector(".user-cover-image").style.filter = "brightness(1)"
    //       }
    //     })
        
    //   }
    // })    
    api.getBing()
    .then(res=>{
      console.log(res)
      if(res.data.success){
        let url = res.data.imgurl
        util.getImageColorSchema(url,e=>{

          document.body.style.backgroundColor = `rgba(${e.r},${e.g},${e.b},${util.isDarkMode?"1":"0.25"})`
          // document.querySelectorAll(".card").forEach(item=>{
          //   item.style.boxShadow = `rgba(${e.r},${e.g},${e.b},0.45) 0 4px 44px 5px`
          // })
        })
        util.getImageBrightness(url,(e)=>{
          document.querySelector(".user-cover-image").src = url
          if(e<110){
            document.querySelector(".user-cover-image").style.filter = "brightness(1)"
          }
        })
        
      }
    })
    
  },
  render(){
    let dom = document.querySelector("#user-info"),
        basic = document.querySelector(".user-basic");
    dom.innerHTML = ""
    let el = util.createDom(`
    <div class="info">
    <h3>${auth.info("nickname")}</h3>
    <p>@${auth.info("username")}</p>
    <br>
    <a class="button" href="/">返回地图</a>
    </div>`)
    
    // el.querySelector("#share")
    // .addEventListener("click",()=>{
    //   let node = document.querySelector("#recent-poi")
    //   domtoimage.toPng(node)
    //   .then(function (dataUrl) {
    //       var img = new Image();
    //       img.src = dataUrl;
    //       document.body.appendChild(img);
    //   })
    //   .catch(function (error) {
    //       console.error('oops, something went wrong!', error);
    //   });
    // })    
    dom.appendChild(el)
    let basicWidth = basic.offsetWidth/2,
        basicHeight= basic.offsetHeight/2,
        radioX = 0.05,
        radioY = 0.1,
        basicCover = basic.querySelector(".user-cover-image")
    basic.addEventListener("mouseenter",(e)=>{
      // basicCover.style.transition = "none"
    })
    basic.addEventListener("mouseleave",(e)=>{
      basicCover.style.transition = "all 1s ease"
      basicCover.style.transform = `translate(0px,0px)`

      setTimeout(()=>{
        basicCover.style.transition = "all .2s ease"
      },1000)

    })
    basic.addEventListener("mousemove",(e)=>{
      let x = parseInt((e.layerX-basicWidth)*radioX),
          y = parseInt((e.layerY-basicHeight)*radioY)
      basicCover.style.transform = `translate(${x}px,${y}px)`
    })
  }
}  
const cityLoader = {
  refresh(){
    let render = this.render
    api.getPointsByCity()
    .then(res=>{
      if(res.data.points){
        render(res.data.points)
      }else{
        document.querySelector("#city-title").remove()
      }
    })   
    .catch(e=>{
      document.querySelector("#city-title").remove()
    }) 
  },
  render(pois){
    let dom = document.querySelector("#city-poi")
    dom.innerHTML = ""
    pois.forEach(poi => {

      let el = util.createDom(`
      <div class="card">
        <div class="poi-item">
          <div class="poi-image">
          </div>
          <div class="poi-content flex">
            <h3>${poi.city}</h3>
            <p>${poi.total}个地点</p>
            <p>${poi.images.length}张照片</p>
          </div>
        </div>
      </div>`)

      if(poi.images){
        poi.images.forEach(item=>{
          el.querySelector(".poi-image").appendChild(util.createDom(`<div class="picture"><img src="${item.thumb}" alt=""></div>`))
        })        
        let mode = poi.images.length>1?(poi.images.length%4):"x";
        el.querySelector(".poi-image").classList.add("grid-mode-"+mode)
        el.querySelectorAll(".picture").forEach((pic,index)=>{
          pic.addEventListener("click",()=>{
            PREVIEW.previewImages(poi.images,index)
          })          
        })        
      }
      dom.appendChild(el)
    });
    // document.querySelector("#city-poi").appendChild(dom)
    // console.log(util.createDom(dom))
  }
}
const recentLoader = {
  refresh(){
    let _render = this.render
    api.getPointsByTime()
    .then(res=>{
      if(res.data.points){
        _render(res.data.points)
      }else{
        document.querySelector("#recent-title").remove()
      }
    })    
  },
  render(pois){
    let dom = document.querySelector("#recent-poi")
    dom.innerHTML = ""
    pois.forEach(poi => {

      let el = util.createDom(`
      <div class="card">
        <div class="poi-item">
          <div class="poi-image">
          </div>
          <div class="poi-content">
            <div class="flex"> <h3>${poi.city}</h3><p><small>${new Date(poi.dateTime).format("yyyy-MM-dd")}</small></p></div>
            <h4>${poi.title}</h4>
            <p>${poi.remark}</p>
            
          </div>
        </div>
      </div>`)

      if(poi.images){
        poi.images.forEach(item=>{
          el.querySelector(".poi-image").appendChild(util.createDom(`<div class="picture"><img src="${item.thumb}" alt=""></div>`))
        })        
        let mode = poi.images.length>1?(poi.images.length%4):"x"
        el.querySelector(".poi-image").classList.add("grid-mode-"+mode)

        el.querySelectorAll(".picture").forEach((pic,index)=>{
          pic.addEventListener("click",()=>{
            PREVIEW.previewImages(poi.images,index)
          })          
        })
      }
      dom.appendChild(el)
    });
  }
}
window.onload = ()=>{
  userLoader.refresh()
  cityLoader.refresh()
  recentLoader.refresh()
  util.lazyLoad()
}