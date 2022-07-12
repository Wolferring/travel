import util from "./util.js"
import api from "./fetch.js"
import {GLOBAL_EVENT} from './event.js'
const AUTH = (()=>{

  let dom = util.createDom(`<div id="login-form-container">
      <form class="form" id="login-form">
        <div class="form-heading flex-column">
          <h3>途纪</h3>
          <p>去过的地方和读过的书，构成独一无二的你</p>
        </div>      
        <div class="form-group">
          <label>用户名</label>
          <input autocomplete required="required" class="form-control" type="text" name="username">
        </div>
        <div class="form-group">
  
          <label>密码</label>
          <input autocomplete required="required" type="password" class="form-control"  name="password" /> 
        </div>  
       <div class="form-group">
          <button type="button" class="button" id="login-form-submit">登录</button>
        </div> 
       <div class="form-group flex login-form-footer">
          <small>还没有账号？</small>
          <a href="javascript:void(0);"  onclick="AUTH.switch()"><small>免费注册</small></a>
  
        </div>                
      </form>
      <form class="form" id="register-form">
        <div class="form-heading flex-column">
          <h3>途纪</h3>
          <p>去过的地方和读过的书，构成独一无二的你</p>
        </div>      
        <div class="form-group">
          <label>登录用户名</label>
          <input autocomplete required="required" class="form-control" type="text" name="username">
        </div>
        <div class="form-group">
          <label>显示名称</label>
          <input autocomplete required="required" class="form-control" type="text" name="nickname">
        </div>      
        <div class="form-group">
  
          <label>密码</label>
          <input required="required" type="password" class="form-control" name="password" /> 
        </div> 
        <div class="form-group">
  
          <label>确认密码</label>
          <input required="required" name="repassword" type="password" class="form-control" /> 
        </div>        
       <div class="form-group">
          <button type="button" class="button" id="register-form-submit">注册</button>
        </div> 
       <div class="form-group flex login-form-footer">
          <small>已有账号？</small>
          <a href="javascript:void(0);" onclick="AUTH.switch()"><small>立即登录</small></a>
        </div>                
      </form>    
    </div>`),
      loginForm = dom.querySelector("#login-form"),
      registerForm = dom.querySelector("#register-form"),
      userDetail = {};
  const ins = {
    refresh(){
      let _this = this
      return new Promise((resolve,reject)=>{
        api.getUserInfo()
        .then(res=>{
            userDetail = res.data
            _this.close()
            resolve(userDetail)
        })
        .catch(e=>{
          if(e.status==-1){
            _this.open()
          }
          reject(e)
        })            
        
      })
    },
    open(){
      if(!document.querySelector("#login-form-container")){
        document.body.appendChild(dom)
      }
      dom.classList.add("active")
    },
    close(){
      loginForm.reset()
      dom.classList.remove("active")
    },
    switch(){
      dom.classList.toggle("register")
    },
    info(key){
      if(key&&Object.prototype.hasOwnProperty.call(userDetail,key)) 
        return userDetail[key]
      return userDetail
    },
    register(){
      let _this = this

      if(!util.valid("#register-form")) return Promise.reject("表单验证失败")

      let formData = new FormData(registerForm),
          params = {};
      formData.forEach((v,k)=>{
        params[k] = v
      })
      return api.register(params)
      .then(res=>{
          try{
            window.localStorage.setItem("AUTH",res.data.token)
          }catch(e){}
          userDetail = res.data
          _this.refresh()
          _this.close()
      })             
    },
    login(){
      let _this = this
      if(!util.valid("#login-form")) return Promise.reject("表单验证失败")

      let formData = new FormData(loginForm),
          params = {};
      formData.forEach((v,k)=>{
        params[k] = v
      })
      return new Promise((resolve,reject)=>{
        api.login(params)
        .then(res=>{
          try{
            window.localStorage.setItem("AUTH",res.data.token)
          }catch(e){}
          userDetail = res.data
          console.log(_this)
          _this.refresh()
          _this.close()
          resolve()
        }) 
        .catch(e=>{
            util.toast(e.data.msg,{
              type:"error"
            })
            reject()
        })             
      })

    },
    logout(e){
      util.confirm("确认退出登录",{
        fitEl:e.target||null
      })
      .then((confirm)=>{
        if(confirm){
          window.localStorage.removeItem("AUTH")
          window.location.reload()
        }
      })
    }
  }  

  dom
  .querySelector("#login-form-submit")
  .addEventListener("click",(e)=>{
    ins.login()
    .then(res=>{
      GLOBAL_EVENT.emit("auth:login")
    })
  })   
  dom
  .querySelector("#register-form-submit")
  .addEventListener("click",(e)=>{
    ins.register()
    .then(res=>{
      GLOBAL_EVENT.emit("auth:login")
    })
  })  
  GLOBAL_EVENT.on("auth:logout",(e)=>{
    ins.logout(e)
  })  
  window.AUTH = ins
  return ins
})()

export default AUTH