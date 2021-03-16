import "./styles/user.less"
import {GLOBAL_EVENT} from "./event.js"
import util from "./util.js"
// import Upload from "./upload.js"
import api from './fetch.js'
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
const cityLoader = {
  refresh(){
    let render = this.render
    api.getPointsByCity()
    .then(res=>{
      render(res.data.points)
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
      poi.images.forEach(item=>{
        el.querySelector(".poi-image").appendChild(util.createDom(`<div class="picture"><img src="${item.thumb}" alt=""></div>`))
      })
      if(poi.images.length==3){
        el.querySelector(".poi-image").classList.add("grid-mode-3")
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
      _render(res.data.points)
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
      poi.images.forEach(item=>{
        el.querySelector(".poi-image").appendChild(util.createDom(`<div class="picture"><img src="${item.thumb}" alt=""></div>`))
      })
      if(poi.images.length==3){
        el.querySelector(".poi-image").classList.add("grid-mode-3")
      }
      dom.appendChild(el)
    });
  }
}
window.onload = ()=>{
  cityLoader.refresh()
  recentLoader.refresh()
}