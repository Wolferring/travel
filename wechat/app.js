const api = require("./utils/fetch")



function Watcher(key, gd, fn) {
  this.key = key
  this.gd = gd
  this.fn = fn

  Dep.target = this
  let arr = key.split('.')
  let val = this.gd
  arr.forEach(key => {
    val = val[key]
  })
  Dep.target = undefined
}

Watcher.prototype.update = function () {
  let arr = this.key.split('.')
  let val = this.gd
  arr.forEach(key => {
    val = val[key]
  })
  this.fn(val)
}

function Dep() {
  this.subs = []
}

Dep.prototype = {
  addSubs(watcher) {
    this.subs.push(watcher)
  },
  notify() {
    this.subs.forEach(watcher => {
      watcher.update()
    })
  }
}
// app.js
App({
  onShow(options){
    this.observe(this.globalData.USER)
    const _this = this
    let isLaunchShare = (options.path=="pages/detail/detail"&&options.query.id)
    if(!isLaunchShare||wx.getStorageSync('AUTH')){
      api.getUserInfo()
      .then(res=>{
        _this.globalData.USER.userInfo  = res.data
        _this.globalData.USER.isLogin = true
        if(!res.data.openId){
          wx.login({
            success:(e=>{
              if(e.errMsg=='login:ok'){
                api.bindWX(e.code)
              }
            })
          })
        }
      })
    }    
  },
  onLaunch(options) {
    // 展示本地存储能力
    // 登录
    // this.observe(this.globalData.USER)
    // const _this = this
    // let isLaunchShare = (options.path=="pages/detail/detail"&&options.query.id)
    // if(!isLaunchShare||wx.getStorageSync('AUTH')){
    //   api.getUserInfo()
    //   .then(res=>{
    //     _this.globalData.USER.userInfo  = res.data
    //     _this.globalData.USER.isLogin = true
    //   })
    // }

  },
  Observe: function (data) {
    let _this = this
    for (let key in data) {
      let val = data[key]
      this.observe(data[key])
      let dep = new Dep()   //Dep的实例可在set和get中闭包访问
                            //也就是说每个key都有对应的要通知的观察列表
      Object.defineProperty(data, key, {
        configurable: true,
        get() {
          Dep.target && dep.addSubs(Dep.target)     //获取app.globalData.wxMinix对应的值时进行订阅
          return val
        },
        set(newValue) {
          if (val === newValue) {
            return
          }
          val = newValue
          _this.observe(newValue)
          dep.notify()      // 当app.globalData.wxMinix对应的值变化时发布
        }
      })
    }
  },
  observe: function (data) {
    if (!data || typeof data !== 'object') return   
    this.Observe(data)
  },
  makeWatcher: function (key, gb, fn) {
    new Watcher(key, gb, fn)
  },  
  globalData: {
    USER:{
      userInfo: null,
      isLogin:false
    }
  }
})
