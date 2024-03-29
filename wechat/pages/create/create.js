const util = require('../../utils/util.js');

const api = require('../../utils/fetch.js');
const ADDRESS_REG='(?<province>[^省]+自治区|.*?省|.*?行政区|.*?市)(?<city>[^市]+自治州|.*?地区|.*?行政单位|.+盟|市辖区|.*?市|.*?县)(?<county>[^县]+县|.+区|.+市|.+旗|.+海域|.+岛)?(?<town>[^区]+区|.+镇)?(?<village>.*)'
Page({ 
    data: { 
        pois: [], 
        MAP:null,
        scopeIndex:0,
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
        create:{
          dateTime:"",
          lnglat:"",
          images:[],
          address:"",
          city:"",
          province:"",
          scope:"public",
          scoped_list:[]
        },
        latitude: '', 
        longitude: '', 
        tempImages:[],
        uploadedImageIds:[],
        placeData: {},
        creating:false
    }, 
    onLoad: function() { 
        var that = this; 
        // 新建百度地图对象 
        // var BMap = new bmap.BMapWX({ 
        //     ak: '6vLcscHlzeFyTF9Nb7SH9OXVshLU7yYu' 
        // }); 
        // that.setData({
        //   MAP:BMap
        // })
    }, 
    searchFormSubmit(e){
      if(e.detail.value.query){
        this.poiSuggestion(e.detail.value.query)
      }
      if(e.type=="confirm"&&e.detail.value){
        this.poiSuggestion(e.detail.value)

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
        dateTime:this.data.create.dateTime,
        scope:this.data.create.scope,
        scoped_list:this.data.create.scoped_list
      }
      Object.keys(form).forEach(item=>{
        let v = form[item]
        if(v===null||v===""||v===undefined){
          wx.showToast({
            title: '请完整填写表单',
            icon: 'error'
          })
          throw "empty field error"
          return false
        }
      })
      this.setData({
        creating:true,
        create:form
      })
      this.uploadImages()
    },
    postCreateForm(images){
      let _this = this
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
        .finally(res=>{
          _this.setData({
            creating:false
          })
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
      // this.setData({
      //   pois:[]
      // })
      let poi = e
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

    async uploadImages(){
      let uploadedImages = []
      let images = this.data.tempImages,
          _this = this;
      let imagesCount = images.length;
      if(imagesCount==0){
        wx.showToast({
          title: '请选择照片',
          icon:'error'
        })
        this.setData({
          creating:false
        })
        return false
      }
      images.forEach(item=>{
        wx.uploadFile({
          url: api.uploadPath(), //仅为示例，非真实的接口地址
          filePath: item.tempPath,
          header:{
            "Authorization":"Bearer "+wx.getStorageSync('AUTH')
          },
          name: 'files',
          fail(){
            wx.showToast({
              title: '上传图片失败',
              icon:'error'
            })
            this.setData({
              creating:false
            })            
          },
          success (res){
            let result = JSON.parse(res.data)
            imagesCount--
            item.status = "uploaded"
            uploadedImages.push(result.data[0])
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
    parseImage(data){
      // data为ArrayBuffer类型的JPG文件的二进制数据
      let arr=new Uint8Array(data);
      let base=0; // TIFF数据头开始地址
      let timeTagIndex=0; // EXIF时间信息标记开始地址
      for(let i=0;i<arr.length;i++){
          // 获取TIFF数据头地址
          if(arr[i]==69 && arr[i+1]==120 && arr[i+2]==105 && arr[i+3]==102 && arr[i+4]==0 && arr[i+5]==0){
              base=i+6;
          }
          // 获取时间标签地址
          if(arr[i]==0x90 && arr[i+1]==0x03){
              timeTagIndex=i;
              break; // 因为这个if的条件比较容易重复，但是我们要的是第一个，所以这里就可以直接退出了
          }
      }
      
      let bias=0; // 偏移地址
      for(let i=0;i<=3;i++){
          bias=bias<<8;
          bias+=arr[timeTagIndex+8+i];
      }        
      let datetime_addr_index=base+bias; // 实际地址

      let datetimestr=""; // 日期字符串
      for(let i=datetime_addr_index;i<=datetime_addr_index+19;i++){
          datetimestr+=String.fromCharCode(arr[i]);
      }
      console.log(datetimestr)
      return datetimestr.replaceAll(':','/').split(" ")[0]
  },
    chooseImages(){
      let _this = this,
          create = this.data.create;
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
        sizeType:["original"], 
        success:onImageChoose
      })
    },
    openMap(){
      let _this = this
      let query = {
        success(res){
          if(res.errMsg=="chooseLocation:ok"){
            let add = res.address.match(ADDRESS_REG)
            let p = {
              city:add[2],
              province:add[1],
              name:res.name,
              location:{
                lng:res.longitude,
                lat:res.latitude
              }
            }     
            _this.poiSelect(p)    
          }
        } 
      }
      if(_this.data.create.lnglat){
        query['latitude'] = _this.data.create.lnglat.split(",")[1]
        query['longitude'] = _this.data.create.lnglat.split(",")[0]
      }
      wx.chooseLocation(query)
     
    },
    scopeChange(e){
      let create = this.data.create
      create.scope = this.data.scopeType[e.detail.value]['value']
      this.setData({
        scopeIndex:e.detail.value,
        create:create
      })
    },    
    openScope(){
      let _this = this
      wx.navigateTo({
        url: '/pages/create/scope',
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          acceptDataFromOpenedPage: function(data) {
            let create = _this.data.create
            create.scope = data.scope
            create.scoped_list = data.list.length==0?[]:data.list.map(item=>item.id)
            let scopeIndex = 0;
            _this.data.scopeType.forEach((item,index)=>{
              if(item.value==data.scope){
                scopeIndex=index
              }
            })
            _this.setData({
              scopeIndex:scopeIndex,
              create:create
            })
          },
        },
        success: function(res) {
          // 通过 eventChannel 向被打开页面传送数据
          res.eventChannel.emit('acceptDataFromOpenerPage', {
            scope:_this.data.create.scope,
            scope_list:_this.data.create.scoped_list
          })
        }
      })      
    }
})
