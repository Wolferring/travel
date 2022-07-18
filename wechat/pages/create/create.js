var bmap = require('../../libs/bmap.js'); 
const { upload } = require('../../utils/fetch.js');
const api = require('../../utils/fetch.js');
var wxMarkerData = []; 
Page({ 
    data: { 
        pois: [], 
        MAP:null,
        create:{
          dateTime:"",
          lnglat:"",
          images:[],
          address:"",
          city:"",
          province:""
        },
        latitude: '', 
        longitude: '', 
        tempImages:[],
        uploadedImageIds:[],
        placeData: {} 
    }, 
    onLoad: function() { 
        var that = this; 
        // 新建百度地图对象 
        var BMap = new bmap.BMapWX({ 
            ak: '6vLcscHlzeFyTF9Nb7SH9OXVshLU7yYu' 
        }); 
        that.setData({
          MAP:BMap
        })
       // 发起POI检索请求 
        // this.poiSuggestion("兴隆湖")
    }, 
    searchFormSubmit(e){
      if(e.detail.value.query){
        this.poiSuggestion(e.detail.value.query)
      }
    },
    createFormSubmit(e){
      let query = e.detail.value
      let _this = this
      let form = {
        lnglat:this.data.create.lnglat,
        title:query.title,
        remark:query.remark,
        city:this.data.create.city,
        province:this.data.create.province,
        address:this.data.create.address,
        dateTime:this.data.create.dateTime
      }
      Object.keys(form).forEach(item=>{
        let v = form[item]
        if(v==null||v==""||v==undefined){
          wx.showToast({
            title: '请完整填写表单',
            icon: 'error'
          })
          throw "empty field error"
          return false
        }
      })
      this.setData({
        create:form
      })
      this.uploadImages()
    },
    postCreateForm(images){
      if(images.length){
        let form = this.data.create
        form.images = images
        api.createPoint(form)
        .then(res=>{
          wx.showToast({
            title: '创建成功'
          })
          setTimeout(function(){
            wx.navigateBack({
              delta: 0,
            })
          },2000)

        })
      }
    },
    poiSuggestion(e){
      let _this = this
      var fail = function(data) { 
        // console.log(data) 
        wx.showToast({
          title: '搜索失败',
          icon:'error'
        })
      }; 
      var success = function(data) { 
        _this.setData({
          pois:data.result
        })
      }      
      if(this.data.MAP){
        this.data.MAP.suggestion({ 
          query: e, 
          fail: fail, 
          success: success 
        }); 
      } 
      
    },
    poiSelect(e){
      this.setData({
        pois:[]
      })
      let poi = e.currentTarget.dataset.poi
      let form = this.data.create
      form.city = poi.city
      form.province = poi.province
      form.address = poi.name
      form.lnglat = poi.location.lng+","+poi.location.lat
      this.setData({
        create:form
      })
    },    
    dateTimeChange(e){
      let form = this.data.create
      form.dateTime = e.detail.value
      this.setData({
        create:form
      })
    },
    mapClick(e){

    },
    async uploadImages(){
      let uploadedImages = []
      let images = this.data.tempImages,
          _this = this;
      let imagesCount = this.data.tempImages.length;
      images.forEach(item=>{
        wx.uploadFile({
          url: api.uploadPath(), //仅为示例，非真实的接口地址
          filePath: item.tempPath,
          header:{
            "Authorization":"Bearer "+wx.getStorageSync('AUTH')
          },
          name: 'files',
          success (res){
            let result = JSON.parse(res.data)
            imagesCount--
            item.status = "uploaded"
            uploadedImages.push(result.data[0])
            console.log(result)
            _this.setData({
              tempImages:images,
              uploadedImageIds:uploadedImages
            })
            if(imagesCount==0){
              _this.postCreateForm(uploadedImages)
            }
          }
        })  

      })
    },
    deleteChoosedImages(e){
      let index = e.currentTarget.dataset.index
      let images = this.data.tempImages
      images.splice(index,1)
      this.setData({
        tempImages:images
      })
    },
    chooseImages(){
      let _this = this
      let onImageChoose = function(e){
        if(e.tempFiles.length){
          let images = e.tempFiles.map(item=>{
            return {
              tempPath:item.tempFilePath,
              size:item.size,
              status:"waiting"
            }
          })
          let choosed = _this.data.tempImages
          _this.setData({
            tempImages:choosed.concat(images)
          })
        }
      }
      wx.chooseMedia({
        mediaType:["image"],
        sourceType:["album"],
        sizeType:["compressed"],
        success:onImageChoose
      })
    }
})