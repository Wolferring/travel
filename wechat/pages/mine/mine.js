// pages/mine/mine.js
const api = require("../../utils/fetch")
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pagePois:[],
    pageShow:false,
    pageTitle:null,
    isLogin:false,
    windowHeight:400,
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
        windowWidth = 0,
        w = 0,
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
      windowWidth = window.windowWidth
    }    
    _this.setData({
      windowHeight:windowHeight
    })     
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
  openCityView(e){
    let _this = this
    console.log(e.currentTarget.dataset.city)
    let city = e.currentTarget.dataset.city
    api.getPoints({
      city:city
    })
    .then(res=>{
      _this.setData({
        pagePois:res.data.points,
        pageShow:true,
        pageTitle:city
      })
      console.log(res)
    })
  },
  openDetail(e){
    let poi = e.currentTarget.dataset.poi
    wx.navigateTo({
      url: '/pages/detail/detail',
      success: function(res) {
        // 通过 eventChannel 向被打开页面传送数据
        res.eventChannel.emit('sendPoiDetail', poi)
      }
    })    
  },  
  openProvinceView(e){
    let _this = this
    let province = e.currentTarget.dataset.province
    api.getPoints({
      province:province
    })
    .then(res=>{
      _this.setData({
        pagePois:res.data.points,
        pageShow:true,
        pageTitle:province
      })
    })
  }, 
  openProfile(){
    wx.navigateTo({
      url: '/pages/profile/profile?id='+this.data.user.id,
    })
  }   
})