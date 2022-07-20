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
    currentPhone:"",
    smsDisabled:true,
    smsLoading:false,
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
    api.sendRegisterSMS({
      phone:phone
    })
    .then(res=>{
      wx.showToast({
        title: '验证码已发送',
      })
    })
    .catch(e=>{
      wx.showToast({
        title: e.msg,
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
    let hasEmptyValue = Object.keys(form).some((item=>{
      return form[item]==""
    }))
    let usernameNotAllow = !validPhone(form.phone)
    let passwordNotEqual = (form.password!=form.valid_password)
    let passwordNotAllow = form.password.length<8
    let message = {
      hasEmptyValue:{
        invalid:hasEmptyValue,
        msg:"请完善表单",
      },
      usernameNotAllow:{
        invalid:usernameNotAllow,
        msg:"手机号填写错误"
      },
      passwordNotEqual:{
        invalid:passwordNotEqual,
        msg:"两次密码不符"
      },
      passwordNotAllow:{
        invalid:passwordNotAllow,
        msg:"密码不符合规范"
      },
    }
    let keys = Object.keys(message)
    for(let m of keys){
      
      if(message[m].invalid){
        wx.showToast({
          title: message[m].msg,
          icon:'error'
        })
        return false
      }
    }
    let _this = this
    api.register(form)
    .then(res=>{
      if(res.data.token){
        app.globalData.USER.isLogin = true
        wx.setStorageSync('AUTH', res.data.token)
        wx.switchTab({
          url: '/pages/index/index',
        })
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
  },  
  onChooseAvatar(e){
    console.log(e.detail)
  }
})