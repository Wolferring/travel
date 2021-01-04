import "./styles/user.less"
import {GLOBAL_EVENT} from "./event.js"
import util from "./util.js"
import Upload from "./upload.js"
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
const upload = new Upload("#avatar-upload",{
  multiple:false,
  maxSize:2*1024,
  success:avatarSuccess
})