// index.js
// 获取应用实例
const app = getApp()
const util = require("../../utils/util")

const api = require("../../utils/fetch")
let bannerLoading = false
Page({
  data: {
    banner:{
      id:null
    },
    bannerLoading:false,
    isLogin:false,
    isEditShow:false,
    points:[],
    keyboardHeight:0,
    triggered:false,
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
  renderBanner(){
    let _this = this
    if(!_this.data.banner.id&&!_this.data.bannerLoading){
      _this.setData({
        bannerLoading:true
      })      
      api.getPointByRand()
      .then(res=>{
        if(res.data){
          _this.setData({
            banner:res.data
          })      
        }
      })  
      .finally(res=>{
        _this.setData({
          bannerLoading:false
        })
      })     
    }  
  },
  onLoad(){
    let _this = this
    app.makeWatcher('USER.isLogin', app.globalData, function(newValue) {
      _this.setData({
          isLogin: newValue
      })
      if(newValue){
        _this.renderBanner()
      }
    })    
  },
  onShow() {
    let _this = this
    api.getPoints()
    .then(res=>{
      _this.setData({
        points:res.data.points
      })
    })
    _this.renderBanner()      

    if(app.globalData.USER){
      this.setData({
        user:app.globalData.USER.userInfo,
        isLogin:app.globalData.USER.isLogin
      }) 
    }    
  },
  openDetail(e){
    let poi = e.currentTarget.dataset.poi
    poi.owned = true
    wx.navigateTo({
      url: '/pages/detail/detail',
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
    util.openLogin()
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
  openCreate(){
    this.setData({
      triggered:true
    })
  },
  //编辑
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
  },
  onRefresh(){
    let _this = this
    if(_this.data.isLogin){
      wx.navigateTo({
        url: '/pages/create/create',
      })
    }else{
      _this.openLogin()
    }
    setTimeout(function(){
      _this.setData({
        triggered:false
      })
    },800)    
  }
})
