// pages/mine/mine.js
const api = require("../../utils/fetch")
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin:false,
    user:{},
    sta:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  showBackground(res){
    console.log(res)
  },
  logout(){
    let _this = this
    wx.showModal({
      content: '确认退出登录？',
      confirmText:"退出登录",
      success (res) {
        if (res.confirm) {
          wx.removeStorageSync('AUTH')
          _this.setData({
            sta:null,
            isLogin:false
          })
          wx.navigateTo({
            url: '/pages/login/login',
          })
          app.globalData.USER.isLogin = false
          app.globalData.USER.userInfo = {}
        } else if (res.cancel) {
        }
      }
    })
        
    
  },
  onLoad(options) {
    let _this = this
    app.makeWatcher('USER.isLogin', app.globalData, function(newValue) {
      _this.setData({
          isLogin: newValue
        })
    })
    app.makeWatcher('USER.userInfo', app.globalData, function(newValue) {
      _this.setData({
          user: newValue
        })
    })    
      
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let _this = this
    api.getPointsStatistic()
    .then(res=>{
      _this.setData({
        sta:res.data
      })
    })
    if(app.globalData.USER){
      this.setData({
        user:app.globalData.USER.userInfo,
        isLogin:app.globalData.USER.isLogin
      }) 
    }
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  }
})