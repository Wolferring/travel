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

    let pass = wx.getStorageSync('PASS'),
        username = wx.getStorageSync('USERNAME')
    if(pass&&username){
      this.setData({
        savedPass:this.decrypt(pass),
        savedUsername:username,
        isSavedPassword:true
      })
    }

 
  },
  savePasswordChange(e){
    if(!e.detail.value){
      wx.removeStorageSync('PASS')
      wx.removeStorageSync('USERNAME')
      // this.setData({
      //   savedUsername:"",
      //   savedPass:""
      // })
    }else{

    }
    this.setData({
      isSavedPassword:e.detail.value
    })
  },
  formSubmit(e){
    if(!e.detail.value.password||!e.detail.value.username){
      return false
    }
    let _this = this
    api.login(e.detail.value)
    .then(res=>{
      if(res.data.token){
        app.globalData.USER.isLogin = true
        wx.setStorageSync('AUTH', res.data.token)
        if(this.data.isSavedPassword){
          wx.setStorageSync('PASS', _this.encrypt(e.detail.value.password))
          wx.setStorageSync('USERNAME', e.detail.value.username)
        }
        api.getUserInfo()
        .then(res=>{
          app.globalData.USER.userInfo  = res.data
          app.globalData.USER.isLogin = true
        })     
        wx.navigateBack({
          delta: 0,
        })   
        // wx.switchTab({
        //   url: '/pages/index/index',
        // })
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
})