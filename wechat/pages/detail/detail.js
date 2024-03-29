const api = require("../../utils/fetch")
const util = require("../../utils/util")
// pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user:{},
    author:null,
    poi:null,
    comments:[],
    scopeIndex:0,
    scope_list:[],
    scopeType:[
      {
        desc:"公开（可分享）",
        value:"public"
      },
      {
        desc:"仅自己可见",
        value:"private"
      },
      {
        desc:"部分可见",
        value:"must_in"
      },
      {
        desc:"不给谁看",
        value:"not_in"
      }                    
    ],  
    isEditShow:false,
    editContainerAnimation:null,
    editContentAnimation:null,
    keyboardHeight:0,
    titleFontSize:24,
    contentHeight:300,
    isLogin:false,
    isShareMode:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  render(poi){
    let window = wx.getSystemInfoSync(),
        windowWidth = 0,
        windowHeight = 0,
        w = 0,
        _this = this;
    if(window){
        windowWidth = window.windowWidth - 40
        windowHeight = window.windowHeight
        w = windowWidth/(poi.title.length+1)
    }
    let scope_list = []
    if(poi.scope=="must_in"||poi.scope=="not_in"){
      scope_list = poi.scoped_list.split(',')
    }
    _this.setData({
      poi:poi,
      scope_list:scope_list,
      scopeIndex:{'private':1,'public':0,'must_in':2,'not_in':3}[poi.scope],
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
    }else{
      const launch = wx.getLaunchOptionsSync()
      if([1014,1107].indexOf(launch.scene)>-1){
        wx.showModal({
          title:"想知道有人给您评论了？",
          content:"请允许给您发送新评论通知",
          success(e){
            wx.requestSubscribeMessage({
              tmplIds: ['SYnJ0O9IaRByBo-f491qlk-XA_yi_N8HYOdNCMYTQc0'],
              fail(e){console.log(e)}
            })
            wx.setStorageSync('NOTIFY_EXPIRE', new Date().getTime())
          }
        })       
      }      
    }
    _this.getComments(poi.id)

  },
  getComments(pid){
    let _this = this
    api.getPointComments({
      pid:pid
    })
    .then(res=>{
      if(res.status==1){
        _this.setData({
          isLogin:true,
          comments:res.data
        })
        
      }
    })
    .catch(e=>{
      
    })    
  },
  onShow(){
    const app = getApp()
    let _this = this 
    if(app.globalData.USER){
      this.setData({
        isLogin:app.globalData.USER.isLogin,
        user:app.globalData.USER.userInfo
      }) 
    }    
    let launch = getCurrentPages()
    if(launch.length==1){
      _this.setData({
        isShareMode:true
      })
    }   
    app.makeWatcher('USER.userInfo', app.globalData, function(newValue) {
      _this.setData({
          user: newValue
        })
    })  
    app.makeWatcher('USER.isLogin', app.globalData, function(newValue) {
      _this.setData({
          isLogin: newValue
      })
      try{
        if(newValue&&_this.data.poi.id){
          _this.getComments(_this.data.poi.id)
        }
      }catch(e){}

    })                       
  },
  onLoad(option) {
    const _this = this
    if(option.author){
      this.setData({
        author:option.author
      })
    }      
    if(option&&option.id){
      api.getSharedPoint(option.id)
      .then(res=>{
        _this.render(res.data)
      }) 
    }


  
    const eventChannel = this.getOpenerEventChannel()
    if(eventChannel&&!option.id){
      eventChannel.on('sendPoiDetail', function(data) {
        _this.render({owned:data.owned,...data})
      })
    }

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
  },
  openScope(){
    let _this = this
    wx.navigateTo({
      url: '/pages/create/scope',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        acceptDataFromOpenedPage: function(data) {
          let scope_list = data.list.length==0?[]:data.list.map(item=>item.id)
          let scopeIndex = 0;
          _this.data.scopeType.forEach((item,index)=>{
            if(item.value==data.scope){
              scopeIndex=index
            }
            console.log(item,index)
          })
          _this.setData({
            scope_list:scope_list,
            scopeIndex:scopeIndex
          })
        },
      },
      success: function(res) {
        // 通过 eventChannel 向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', {
          scope:_this.data.scopeType[_this.data.scopeIndex]['value'],
          scope_list:_this.data.scope_list||[]
        })

      }
    })      
  },  
  scopeChange(e){
    this.setData({
      scopeIndex:e.detail.value,
    })
  },  
  closeEdit(){
    let _this = this
   
    _this.setData({
      isEditShow:false
    })

  },  
  formSubmit(e){
    let current = this.data.poi,
        _this = this,
        scope_list = this.data.scope_list,
        scope = this.data.scopeType[this.data.scopeIndex]['value'], 
        newTitle = e.detail.value.title,
        newRemark = e.detail.value.remark;
        console.log(scope_list)
    api.updatePoint(current.id,{
      title:newTitle,
      remark:newRemark,
      scope:scope,
      scoped_list:scope_list,
      dateTime:new Date(current.dateTime).toISOString().slice(0, 19).replace('T', ' ')
    })
    .then(res=>{
      wx.showToast({
        title: '修改成功',
      })
      current.title = newTitle
      current.remark = newRemark
      current.scope = scope
      _this.setData({
        isEditShow:false,
        poi:current,
      })
    })
  },  
  openDeleteComment(e){
    let comment = e.currentTarget.dataset.comment,
        _this = this;
    const app = getApp()
    if(comment.from_id==app.globalData.USER.userInfo.id){
      wx.showModal({
        title:"确认删除评论？",
        content:comment.content,
        confirmText:"确认删除",
        success:(e)=>{
          if(e.confirm){
            api.removeComment(comment.id)
            .then(res=>{
              if(res.status==1){
                wx.showToast({
                  title: '删除评论成功'
                })
                _this.getComments(_this.data.poi.id)
              }
            })
          }
        }
      })
    }
  },
  openComment(){
    let _this = this
    let poi = _this.data.poi
    wx.showModal({
      title:"评论足迹",
      editable:true,
      confirmText:"发表评论",
      success:(e)=>{
        if(e.confirm&&e.content){
          let query = {
            content:e.content,
            to_id:poi.uid,
            pid:poi.id
          }
          api.createComment(query)
          .then(res=>{
            if(res.status==1){
              wx.showToast({
                title: '评论成功',
              })
              _this.getComments(poi.id)
            }
          })
        }
      }
    })
  },
  openLogin(){
    util.openLogin()
  },
  openIndex(){
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  openMap(){
    let _this = this
    wx.navigateTo({
      url: '/pages/map/map',
      success:(res)=>{
        if(_this.data.poi.lnglat){
          res.eventChannel.emit('acceptDataFromOpenerPage', _this.data.poi)
        }
      }
    })     
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    let author = null
    let query = `id=${this.data.poi.id}`
    const app = getApp()
    if(this.data.poi.owned&&app.globalData.USER.userInfo){
      author = app.globalData.USER.userInfo.nickname
      query+=`&author=${author}`
    }    
    let title = author?`来自${author}的分享`:this.data.poi.title
    return {
      title: title,
      path: '/pages/detail/detail?'+query
    }
  },
  onShareTimeline(){
    let author = null
    let query = `id=${this.data.poi.id}`
    const app = getApp()
    if(this.data.poi.owned&&app.globalData.USER.userInfo){
      author = app.globalData.USER.userInfo.nickname
      query+=`&author=${author}`
    }
    return {
      imageUrl:'https:'+this.data.poi.images[0]['thumb'],
      title:this.data.poi.title,
      query:query
    }
  }
})