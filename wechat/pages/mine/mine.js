// pages/mine/mine.js
const api = require("../../utils/fetch")
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin:false,
    sta:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  showBackground(res){
    console.log(res)
  },
  logout(){
    wx.showModal({
      content: '确认退出登录？',
      confirmText:"退出登录",
      success (res) {
        if (res.confirm) {
          wx.setStorageSync('AUTH', null)
          this.setData({
            sta:null,
            isLogin:false
          })
          wx.navigateTo({
            url: '/pages/login/login',
          })
        } else if (res.cancel) {
        }
      }
    })
        
    
  },
  onLoad(options) {
    let _this = this
    this.setData({
      isLogin:app.globalData.USER.isLogin
    })
    app.makeWatcher('USER.isLogin', app.globalData, function(newValue) {
      _this.setData({
          isLogin: newValue
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
      console.log(res)
      _this.setData({
        sta:res.data
      })
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  openLogin(){
    wx.navigateTo({url:'/pages/login/login'})
  }
})