// pages/mine/mine.js
const api = require("../../utils/fetch")
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin:false,
    statusBarHeight:44,
    contentHeight:300,
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
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let window = wx.getSystemInfoSync(),
        windowHeight = 0,
        _this = this; 
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
    let menu = wx.getMenuButtonBoundingClientRect()
    _this.setData({
      statusBarHeight:menu.top      
    })
    if(window){
      windowHeight = window.windowHeight
    }    
    const tabbarHeight = ( window.screenHeight - window.windowHeight - window.statusBarHeight )   
    let scrollContent = wx.createSelectorQuery()
    scrollContent.select('#scroll-content').boundingClientRect()
    scrollContent.exec(res=>{
      windowHeight = windowHeight - res[0].top - tabbarHeight + 35
      _this.setData({
        contentHeight:windowHeight
      })
      
    })    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  }
})