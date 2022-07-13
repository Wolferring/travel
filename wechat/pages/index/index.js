// index.js
// 获取应用实例
const app = getApp()
const api = require("../../utils/fetch")
Page({
  data: {
    isLogin:false,
    isEditShow:false,
    points:[],
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
  onLoad() {
    let _this = this
    app.makeWatcher('USER.isLogin', app.globalData, function(newValue) {
      _this.setData({
          isLogin: newValue
        })
    })  
    api.getPointsByTime({
      limit:10
    })
    .then(res=>{
      _this.setData({
        points:res.data.points
      })
      console.log(res)
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
      isEditShow:false
    })
  },
  formSubmit(e){
    let current = this.data.current_poi,
        _this = this;
        console.log(current)
    api.updatePoint(current.id,{
      title:current.title,
      remark:e.detail.value.remark,
      dateTime:new Date(current.dateTime).toISOString().slice(0, 19).replace('T', ' ')
    })
    .then(res=>{
      wx.showToast({
        title: '修改成功',
      })
      _this.setData({
        isEditShow:false,
        current_poi:null
      })
    })
  }
})
