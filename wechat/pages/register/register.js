// pages/login/login.js
const api = require("../../utils/fetch")
const aesjs = require('../../utils/crypto.js')
const app = getApp()
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

  formSubmit(e){
    let hasEmptyValue = Object.keys(e.detail.value).some((item=>{
      return e.detail.value[item]==""
    }))
    let usernameNotAllow = e.detail.value.username.length<5
    let passwordNotEqual = (e.detail.value.password!=e.detail.value.valid_password)
    let passwordNotAllow = e.detail.value.password.length<8
    let message = {
      hasEmptyValue:{
        invalid:hasEmptyValue,
        msg:"请完善表单",
      },
      usernameNotAllow:{
        invalid:usernameNotAllow,
        msg:"登录账户不符合规范"
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
    api.register(e.detail.value)
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