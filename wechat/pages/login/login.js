// pages/login/login.js
const api = require("../../utils/fetch")
const aesjs = require('../../utils/crypto.js')
const app = getApp()
const validPhone = (phone)=>{
  const reg_tel = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
  return reg_tel.test(phone)
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    key:[ 12, 2, 3, 44, 5, 6, 74, 8, 91, 10, 11, 12, 3, 14, 15, 16 ],
    logoAnimation:{},
    contentAnimation:{},
    savedPass:"",
    savedUsername:"",
    isPasswordFocus:false,
    smsLoading:false,
    smsDisabled:true,
    currentPhone:"",
    isSavedPassword:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  encrypt(str){
    var textBytes = aesjs.utils.utf8.toBytes(str);
    var aesCtr = new aesjs.ModeOfOperation.ctr(this.data.key, new aesjs.Counter(5));
    var encryptedBytes = aesCtr.encrypt(textBytes);    
    var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    return encryptedHex  
  },
  decrypt(str){
    var encryptedBytes = aesjs.utils.hex.toBytes(str);
    var aesCtr = new aesjs.ModeOfOperation.ctr(this.data.key, new aesjs.Counter(5));
    var decryptedBytes = aesCtr.decrypt(encryptedBytes);    
    var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    return decryptedText
  },
  onShow() {
    let animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })
    let cAnimation = wx.createAnimation({
      duration: 1000,
      delay:500,
      timingFunction: 'ease',
    })    
    animation.rotate(180).step()
    cAnimation.opacity(1).translateY(0).step()
    this.setData({
      logoAnimation:animation.export(),
      contentAnimation:cAnimation.export()
    })

    let pass = wx.getStorageSync('PASS'),
        username = wx.getStorageSync('USERNAME')
    if(username){
      this.setData({
        savedUsername:username,
        currentPhone:username,
        smsDisabled:false,
        isSavedPassword:true
      })
    }
    if(pass){
      this.setData({
        savedPass:this.decrypt(pass)
      })
    }
  },
  passwordFocus(){
    this.setData({
      isPasswordFocus:true
    })    
  },
  passwordBlur(){
    this.setData({
      isPasswordFocus:false
    })
  },
  savePasswordChange(e){
    if(!e.detail.value){
      wx.removeStorageSync('PASS')
      wx.removeStorageSync('USERNAME')
    }
    this.setData({
      isSavedPassword:e.detail.value
    })
  },
  handleLoginSuccess(res){
    let _this = this
    if(res.data.token){
      wx.setStorageSync('AUTH', res.data.token)
      app.globalData.USER.isLogin = true
      api.getUserInfo()
      .then(res=>{
        app.globalData.USER.userInfo  = res.data
        if(!res.data.openId){
          wx.showModal({
            title:"开启微信快速登录",
            content:"是否绑定当前微信号，下次快速登录",
            confirmText:"绑定微信",
            success(modal){
              if(modal.confirm){
                wx.login({
                  success:(e=>{
                    if(e.errMsg=='login:ok'){
                      api.bindWX(e.code)
                    }
                  })
                })                
              }
            },
            complete(){
              wx.navigateBack({
                delta: 0,
              }) 
              wx.requestSubscribeMessage({
                tmplIds: ['SYnJ0O9IaRByBo-f491qlk-XA_yi_N8HYOdNCMYTQc0']
              })
            }
            
          })
        }else{
          wx.navigateBack({
            delta: 0,
          })           
        }         
      })  
    }    
  },
  loginWX(){
    let _this = this       
    wx.login({
      success:(e=>{
        if(e.errMsg=='login:ok'){
          api.loginWX(e.code)
          .then(res=>{
            _this.handleLoginSuccess(res)
          })
          .catch(err=>{
            
            if(err.msg){
              let title = err.status==2?"微信号尚未绑定，请使用密码登录或注册新用户":err.msg
              wx.showToast({
                title: title,
                icon:"none",
                duration:2500
              })
            }
          })          
        }
      })
    })
  },
  phoneInput(e){
    let disabled = !validPhone(e.detail.value)
    this.setData({
      currentPhone:e.detail.value,
      smsDisabled:disabled
    })
  },  
  sendSMS(){
    let phone = this.data.currentPhone,
        _this = this;
    if(this.data.smsLoading){
      return false
    }
    _this.setData({
      smsLoading:true
    })
    api.sendLoginSMS({
      phone:phone
    })
    .then(res=>{
      wx.showToast({
        title: '验证码已发送',
      })
    })
    .catch(e=>{
      wx.showToast({
        title: e.msg||"发送失败",
        icon:"error"
      })
    })
    .finally(res=>{
      _this.setData({
        smsLoading:false
      })
    })
  },  
  formSubmit(e){
    let form = e.detail.value
    if(!form.password1||!form.username1){
      return false
    }
    let query = {
      username:form.username1,
      password:form.password1
    }
    let _this = this
    api.login(query)
    .then(res=>{
      _this.handleLoginSuccess(res)
      if(_this.data.isSavedPassword){
        if(res.data.authMode=="password"){
          wx.setStorageSync('PASS', _this.encrypt(form.password1))
        }else{
          wx.setStorageSync('PASS', '')
        }
        wx.setStorageSync('USERNAME', form.username1)
      }      
    })
    .catch(err=>{
      if(err.msg){
        wx.showToast({
          title: err.msg,
          icon:"error"
        })
      }
    })
  }
})