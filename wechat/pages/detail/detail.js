const api = require("../../utils/fetch")

// pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    poi:{},
    isEditShow:false,
    editContainerAnimation:null,
    editContentAnimation:null,
    keyboardHeight:0,
    titleFontSize:24,
    contentHeight:300
  },

  /**
   * 生命周期函数--监听页面加载
   */
  render(poi){
    
    let window = wx.getWindowInfo(),
        _this = this,
        windowWidth = window.windowWidth - 40,
        windowHeight = window.windowHeight,
        w = windowWidth/(poi.title.length+1);
    _this.setData({
      poi:poi,
      titleFontSize:w>32?32:w
    })        
    let scrollContent = wx.createSelectorQuery()
    scrollContent.select('#scroll-content').boundingClientRect()
    scrollContent.exec(res=>{
      windowHeight = windowHeight - res[0].top
      if(poi.owned){
        windowHeight-=80
      }
      _this.setData({
        contentHeight:windowHeight
      })
      
    })
    wx.setNavigationBarTitle({
      title: poi.title,
    })  
    if(!poi.owned){
      wx.hideShareMenu({
        menus: ['shareAppMessage', 'shareTimeline']
      })      
    }
    

  },
  onLoad(option) {
    const _this = this
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
  onShow() {

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
  poiEditFocus(e){
    let safe = wx.getDeviceInfo().platform=="ios"?0:0
    this.setData({
      keyboardHeight:e.detail.height - safe
    })
    // let ani = wx.createAnimation({
    //   timingFunction: 'ease',
    //   duration:300
    // })
    // ani.translateY(-(e.detail.height - safe)).step()
    // this.setData({
    //   editContentAnimation:ani.export()
    // })
  },
  poiEditBlur(e){
    this.setData({
      keyboardHeight:0
    })
  },   
  openDelete(){
    let pid = this.data.poi.id
    wx.showModal({
      content: '确认删除记录？不可恢复！',
      confirmText:"确认删除",
      success (res) {
        if (res.confirm) {
          api.removePoint(pid)
          .then(res=>{
            if(getCurrentPages().length==1){
              wx.switchTab({
                url: '/pages/index/index',
                success:()=>{
                  wx.showToast({
                    title: '删除成功'
                  })
                }
              })
            }else{
              wx.navigateBack({
                delta: 0,
                success:()=>{
                  wx.showToast({
                    title: '删除成功'
                  })
                }
              })
            }            


          })
        }
      }
    })
  },
  openEdit(){
    this.setData({
      isEditShow:true
    })    
    
    let ani = wx.createAnimation({
      delay: 200,
      timingFunction: 'ease',
      duration:300
    })
    let ani2 = wx.createAnimation({
      delay: 0,
      timingFunction: 'ease',
      duration:400
    })    
    ani.translateY(0).step()
    ani2.opacity(1).step()
    this.setData({
      editContainerAnimation:ani2.export(),
      editContentAnimation:ani.export()
    })
  },
  closeEdit(){
    let _this = this
    let ani = wx.createAnimation({
      delay: 0,
      timingFunction: 'ease',
      duration:300
    })
    let ani2 = wx.createAnimation({
      delay: 0,
      timingFunction: 'ease',
      duration:400
    })      
    ani.translateY(300).step()    
    ani2.opacity(0).step()
    this.setData({
      editContainerAnimation:ani2.export(),
      editContentAnimation:ani.export(),
      keyboardHeight:0
    })
    setTimeout(function(){
      _this.setData({
        isEditShow:false
      })
    },300)

  },  
  formSubmit(e){
    let current = this.data.poi,
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
      current.remark = newRemark
      _this.setData({
        isEditShow:false,
        poi:current,
      })
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