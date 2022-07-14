// index.js
// 获取应用实例
const app = getApp()
const api = require("../../utils/fetch")
Page({
  data: {
    isLogin:false,
    isEditShow:false,
    points:[],
    keyboardHeight:0,
    current_poi:{
      id:null,
      title:"",
      remark:"",
      address:"",
      dateTime:""
    }
  },
  formatTime(t){
    return new Date(t).format("yyyy-MM-dd")
  },
  onLoad(){
    let _this = this
    app.makeWatcher('USER.isLogin', app.globalData, function(newValue) {
      _this.setData({
          isLogin: newValue
        })
    })      
  },
  onShow() {
    let _this = this
    api.getPointsByTime({
      limit:16
    })
    .then(res=>{
      _this.setData({
        points:res.data.points
      })
    })
  },
  openDetail(e){
    let poi = e.currentTarget.dataset.poi
    wx.navigateTo({
      url: '/pages/detail/detail',
      events: {
        someEvent: function(data) {
          console.log(data)
        }

      },
      success: function(res) {
        // 通过 eventChannel 向被打开页面传送数据
        res.eventChannel.emit('sendPoiDetail', poi)
      }
    })    
  },
  openEditAction(e){
    let _this = this
    let poi = e.currentTarget.dataset.poi
    this.setData({
      current_poi:{
        id:poi.id,
        title:poi.title,
        address:poi.address,
        dateTime:poi.dateTime,
        remark:poi.remark
      }
    })
    wx.showActionSheet({
      itemList: ['编辑'],
      success (res) {
        switch(res.tapIndex){
          case 0:
            _this.setData({
              isEditShow:true
            })
            break;
          default:
            break;
        }
      },
      fail (res) {
        console.log(res.errMsg)
      }
    })
    
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
  openLogin(){
    wx.navigateTo({url:'/pages/login/login'})
  },
  closeEdit(){
    this.setData({
      isEditShow:false,
      keyboardHeight:0
    })
  },
  poiEditFocus(e){
    let safe = wx.getDeviceInfo().platform=="ios"?66:0
    console.log()
    this.setData({
      keyboardHeight:e.detail.height - safe
    })
  },
  poiEditBlur(e){
    this.setData({
      keyboardHeight:0
    })
  },  
  formSubmit(e){
    let current = this.data.current_poi,
        _this = this,
        newRemark = e.detail.value.remark;
    api.updatePoint(current.id,{
      title:current.title,
      remark:newRemark,
      dateTime:new Date(current.dateTime).toISOString().slice(0, 19).replace('T', ' ')
    })
    .then(res=>{
      wx.showToast({
        title: '修改成功',
      })
      let pois = _this.data.points
      pois.forEach(item=>{
        if(item.id==current.id){
          item.remark = newRemark
        }
      })
      _this.setData({
        isEditShow:false,
        points:pois,
        current_poi:null
      })
    })
  }
})
