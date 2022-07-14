const api = require("../../utils/fetch")

// pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    poi:{},
    titleFontSize:24
  },

  /**
   * 生命周期函数--监听页面加载
   */
  render(poi){
    let windowWidth = wx.getWindowInfo().screenWidth - 40
    let w = windowWidth/(poi.title.length+1)

    wx.setNavigationBarTitle({
      title: poi.title,
    })  
    this.setData({
      poi:poi,
      titleFontSize:w>32?32:w
    })    

  },
  onLoad(option) {
    const _this = this
    console.log(option)
    const eventChannel = this.getOpenerEventChannel()
    if(option&&option.id){
      api.getSharedPoint(option.id)
      .then(res=>{
        _this.render(res.data)
      })
    }
    if(eventChannel&&!option.id){
      eventChannel.on('sendPoiDetail', function(data) {
        _this.render({owned:true,...data})
      })
    }

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
  openPreview(e){
    let images = e.currentTarget.dataset.src,
        current = e.currentTarget.dataset.current;
    let url = []
    images.forEach(item=>{
      url.push("https:"+item.url)
    })
    wx.previewImage({
      urls: url,
      current:"https:"+current
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: `${this.data.poi.title}`,
      path: '/pages/detail/detail?id='+this.data.poi.id 
    }
  }
})