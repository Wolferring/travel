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
      if(res.data.token){
        wx.setStorageSync('AUTH', res.data.token)
        app.globalData.USER.isLogin = true
        if(this.data.isSavedPassword){
          wx.setStorageSync('PASS', _this.encrypt(form.password1))
          wx.setStorageSync('USERNAME', form.username1)
        }

        wx.requestSubscribeMessage({
          tmplIds: ['SYnJ0O9IaRByBo-f491qlk-XA_yi_N8HYOdNCMYTQc0']
        }) 
        api.getUserInfo()
        .then(res=>{
          app.globalData.USER.userInfo  = res.data
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
        wx.navigateBack({
          delta: 0,
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
})