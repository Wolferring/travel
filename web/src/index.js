import "./styles/style.less"
import {EventBus,GLOBAL_EVENT} from "./event.js"
import util from "./util.js"
import Upload from "./upload.js"
import api from "./fetch.js"
import PREVIEW from './preview.js'
import AUTH from './auth.js'
import point_icon from "./image/point.png"
import point_temp_icon from "./image/point-temp.png"

const BUS = new EventBus()

window.onload = ()=>{
    AUTH.refresh()
    .then(()=>{
      initApplication()
    })    
    document
    .querySelector("#point-form-submit")
    .addEventListener("click",(e)=>{
      FORM.submit()
    })
    GLOBAL_EVENT.on("auth:login",()=>{
      initApplication()
    })

     
}

var USER_WIDGET = (()=>{
    let dom = document.querySelector("#user-widget-container")
    BUS.on(["map:init","marker:remove","marker:create"],()=>{
      STATISTIC_WIDGET.refresh()
    })
    return{
      show:()=>{
        dom.classList.add("active")
      },
      hide:()=>{
        dom.classList.remove("active")
      }
    }
})()
var STATISTIC_WIDGET = (()=>{
    let dom = document.querySelector("#statistic"),
        detail = ``
    return {
      open:()=>{

      },
      refresh:()=>{
        api.getPointsStatistic()
        .then(res=>{
          let html = util.createDom(`
          <div class="flex-start">
            <a href="/user.html" class="info">
              <h4>${AUTH.info('nickname')}</h4>  
              <p>${AUTH.info('username')}</p>
              <p>${new Date(AUTH.info('create_time')).format("yyyy-MM-dd")}加入</p>
              
            </a>
            <div>
              <button class="button button-logout button-mini">注销</button>
            </div>
          </div> 
          <div class="items">
            <span><b>${res.data.total||0}</b>个地点</span>  
            <span><b>${res.data.province.length}</b>个省</span>
            <span><b>${res.data.city.length}</b>个城市</span>
          </div>`)
          html.querySelector(".button.button-logout").onclick = (ev)=>{
            GLOBAL_EVENT.emit('auth:logout',ev)
          }
          dom.innerHTML = ""
          dom.appendChild(html)
          USER_WIDGET.show()
        })
      }
    }
})()
window.FORM = (()=>{
    let dom = document.querySelector("#point-form-container"),
        form = document.querySelector("#point-form");
    let upload = new Upload("#upload-test",{
      drag:true
    })
    return {
      open:() => {
        dom.classList.add("active")
      },
      close:() => {
        form.reset()
        upload.filePreviewReset()
        if(TEMP_MARKER){
          TEMP_MARKER.setMap(null)
        }
        dom.classList.remove("active")
      },
      submit:()=>{
        if(!util.valid("#point-form")) return false
        if(upload.uploading){
          util.toast("正在上传文件，请勿重复提交",{
            type:"error"
          })
          return false
        }
        upload.upload()
        .then(images=>{
          let formData = new FormData(form),
              params = {
                images:images,
                lnglat:contextMenuPositon,
                city:contextMenuAddress.addressComponent.city,
                province:contextMenuAddress.addressComponent.province
              }
          formData.forEach((val,key)=>{
            params[key] = util.isString(val)?val.trim():val
          })
          api.createPoint(params)
          .then(res=>{
            createMarkers(res.data)
            util.toast("创建足迹成功",{type:"success"})
            FORM.close()
          })            
        })
      }          
    }
})();

var initApplication = ()=>{
  AMapLoader.load({
      "key": "42b77b78693257d472dc3c70311c3b1f",              // 申请好的Web端开发者Key，首次调用 load 时必填
      "version": "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      "plugins": ["AMap.MarkerCluster","AMap.MouseTool","AMap.Geocoder","AMap.Geolocation",'AMap.PlaceSearch','AMap.AutoComplete']           // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
  .then((AMap)=>{
    window.AMap = AMap
    api.getPoints()
    .then(result=>{
      initMap(AMap,result.data.points)
    })
    BUS.emit("map:init")
  })
  .catch((e)=>{
     
  });      
}

//contextMenuPositon，右键点击的位置和地址
//contextMenuAddress
var TEMP_MARKER = null,
    contextMenuPositon = null,
    contextMenuAddress = null,
    MARKERS = [];//点标



var createMarkerContent = (poi)=>{
  let index = MARKERS.length
  let container = util.createDom(
  `<div class='point-detail'><h3>${poi.title}</h3>
  <pre>${poi.remark}</pre>
  <p><small>${poi.province+'-'}${poi.city+'-'}${poi.address}</small></p>
  <p><small>${new Date(poi.dateTime).format("yyyy-MM-dd")}</small></p></div>`)
  if(poi.images&&poi.images.length){
    let images = util.createDom(`<div class="point-images"></div>`)
    poi.images.forEach((p,index)=>{
      let img = util.createDom(`<div class="point-image"><img data-source="${p.url}" data-src="${p.thumb}" alt=""></div>`)
      img.addEventListener("click",()=>{
        PREVIEW.previewImages(poi.images,index)
      })

      images.appendChild(img)
    })
    container.appendChild(images)
  }
  let button = util.createDom("<button class='point-remove button button-mini'>删除</button")
  button.addEventListener("click",()=>{
    removeMarker(poi,index)
  })
  container.appendChild(button)
  return container
}    
var removeMarker = (poi,markerIndex) =>{
  //需要增加删除确认
  util.confirm("确认删除？")
  .then((confirm)=>{
    if(confirm){
      api.removePoint(poi.id)
      .then(res=>{
        MARKERS[markerIndex-1].setMap(null)
        MAP.clearInfoWindow()
        BUS.emit("marker:remove")
      })
    }
  })
}
var markerClick = (e) => {
  var pointDetailWindow = new AMap.InfoWindow({
    closeWhenClickMap:true,
    offset: new AMap.Pixel(0, -30)
  })  
  if(AMap.Browser.mobile){
    pointDetailWindow.on("open",()=>{
      USER_WIDGET.hide()
    }) 
    pointDetailWindow.on("close",()=>{
      USER_WIDGET.show()
    })                
  }    
  let images = e.target.content.querySelectorAll(".point-images img")
  if(images&&images.length){
    for(let image of images){
      if(!image.src){
        image.src = image.getAttribute("data-src")
      }
    }
  }
  pointDetailWindow.setContent(e.target.content);
  pointDetailWindow.open(MAP, e.target.getPosition());

}      
var createMarkers = (types)=>{
  const NormalIcon = new AMap.Icon({
      size: new AMap.Size(30, 30),
      image: point_icon,
      imageSize: new AMap.Size(30, 30),
  });      
  let realType = Object.prototype.toString.call(types)
  switch(realType){
    case "[object String]" :
      if(types=="temp"){
        try{
          TEMP_MARKER.setMap(null)
        }catch(e){}
        // console.log(contextMenuPositon)
        var marker = new AMap.Marker({
          imageSize: new AMap.Size(25, 34),
          position: contextMenuPositon,
          map: MAP,
          offset:new AMap.Pixel(-16, -32),
          icon:point_temp_icon

        });
        marker.on('click', ()=>{
          marker.setMap(null)
          FORM.close()
        });
        TEMP_MARKER = marker
        return TEMP_MARKER
      }
      break;
    case "[object Array]" :
      for (let i = 0; i < types.length; i++) {
          var marker = new AMap.Marker({
              position: types[i]['lnglat'].split(","),
              map: MAP,
              offset:new AMap.Pixel(-16, -30),
              icon:NormalIcon
          });
          MARKERS.push(marker)
          marker.content = createMarkerContent(types[i]);
          marker.on('click', markerClick);
      }        
      break;
    case "[object Object]" :
      var marker = new AMap.Marker({
          position: types['lnglat'].split(","),
          map: MAP,
          offset:new AMap.Pixel(-16, -30),  
          icon:NormalIcon
      });
      MARKERS.push(marker)
      marker.content = createMarkerContent(types);
      marker.on('click', markerClick);      
      break;          
  }
  BUS.emit("marker:create")

}

var initMap = (AMap,interestPoints)=>{
  window.MAP = new AMap.Map('map-container', {
      mapStyle:util.isDarkMode?"amap://styles/dark":"amap://styles/normal",
      zoom:11,//级别
      zooms:[4,14],
      doubleClickZoom:false,
      rotateEnable:false
  })  
  //创建POI详情

  //创建经纬度解码器  
  const geocoder = new AMap.Geocoder({
    extensions:"all"
  })       
  const locator = new AMap.Geolocation({
      enableHighAccuracy: true,//是否使用高精度定位，默认:true
      timeout: 10000         //超过10秒后停止定位，默认：5
  })
  
  createMarkers(interestPoints)
  //创建点标
  //创建搜索
  // var poiSearch = new AMap.AutoComplete({
  //   input:"poi-search-input",
  //   city:"成都"
  // })
  // poiSearch.on("select", (e)=>{
  //   if(e.poi.location){
  //     MAP.setZoomAndCenter(13, [e.poi.location.lng,e.poi.location.lat]);
  //     contextMenuPositon = e.poi.location
  //     handlePointCreate(contextMenuPositon)
  //   }
  // })
  var createSearch = ()=>{
    const searchResultDom = document.querySelector("#search-result")
    const GDSearch= new AMap.AutoComplete();
    // 根据关键字进行搜索
    const HWSearch= new HWMapJsSDK.HWSiteService();
    const renderResult = (result)=>{
      searchResultDom.innerHTML = ""
      result.forEach(item=>{
        let resultItemDom = util.createDom(`<div class="search-item">${item.name}</div>`)
  
        searchResultDom.appendChild(resultItemDom)
        resultItemDom.addEventListener("click",()=>{
          MAP.setZoomAndCenter(13, [item.location.lng,item.location.lat]);
          contextMenuPositon = item.location
          handlePointCreate(contextMenuPositon)        
        })      
      })
    }
    let timer = null
    document.querySelector("#poi-search-input").addEventListener("keydown",function(){
      clearTimeout(timer)
    })
    document.querySelector("#poi-search-input").addEventListener("input",function(ev){
      timer = setTimeout(function(){
        let words = ev.target.value
        let result = []
        HWSearch.querySuggestion({
          query:words
        },function(e){
          if(e.sites&&e.sites.length){
            e.sites.forEach(item=>{
              let tp = {
                address:item.formatAddress,
                location:new AMap.LngLat(item.location.lng, item.location.lat),
                name:`${item.name} - ${item.address.country}`,
                poi:item.poi,
                platform:"HW"
              }
              result.push(tp)
            })
            renderResult(result)
          }
        })
        GDSearch.search(words, function(status, res) {
          // 搜索成功时，result即是对应的匹配数据
          if(res.tips.length){
            res.tips.forEach(item=>{
              if(!item.location) return
              let tp = {
                address:item.address,
                location:new AMap.LngLat(item.location.lng, item.location.lat),
                name:`${item.name} - ${item.address.country}`,
                poi:item.poi,
                platform:"GD"
              }          
              result.push(item)
            })
            renderResult(result)        
          }
        })          
      },500)
   
    })
  }  
  createSearch()
  //创建地图右键菜单
  var contextMenu = new AMap.ContextMenu()
  //右键添加Marker标记
  contextMenu.addItem("添加标记", function (e) {
      var marker = createMarkers("temp")
      FORM.open()
      contextMenu.close()
  }, 0);    
  const createSelect = (options,dom)=>{
    let html = ``
    for(let opt of options){
      html+=`<option value="${opt.name}">${opt.name}</option>`
    }
    dom.innerHTML = html
  }
  const HWMap = new HWMapJsSDK.HWSiteService();
  //地图绑定鼠标右击事件——弹出右键菜单
  var handlePointCreate = (position)=>{
    geocoder.getAddress(position, function(status, result) {
      if (status === 'complete'&&result.regeocode) {
          var address = result.regeocode;
          contextMenuAddress = address
          createSelect(address.pois,document.querySelector("#point-form-container select[name='address']"))
          var marker = createMarkers("temp")
          FORM.open()               
          // // contextMenu.open(MAP, position);
          // if(AMap.Browser.mobile){
          // }else{
          // }
      }else{
        try{
          var request = {
            location: {
                lat: position.lat,
                lng: position.lng
              }
          };          
          HWMap.reverseGeocode(request, function (result, status) {
            console.log(result)
            var address = result.sites[0].address;
            contextMenuAddress = {
              addressComponent:{
                city:address.city,
                province:address.country
              }
            }
            createSelect(result.sites,document.querySelector("#point-form-container select[name='address']"))
            var marker = createMarkers("temp")
            FORM.open()              
          })
        }catch(e){
          console.log(e)
        }
        util.toast('根据经纬度查询地址失败')
      }
    });           
  }
  if(AMap.Browser.mobile){
    let timer = []
    let t = 0
    MAP.on('touchstart', function(event) {
      // 清除默认行为
      // event.preventDefault();
      // 开启定时器
      if(timer) clearTimeout(timer);
      timer.push(setTimeout(() => {
        contextMenuPositon = event.lnglat
        handlePointCreate(contextMenuPositon)
      }, 700));
    });  
    MAP.on('touchend', function(event) {
      // 清除定时器
      util.clearTimeout(timer);
    }); 
    MAP.on('touchmove', function(event) {
      // 清除定时器
      util.clearTimeout(timer);
    }); 
    MAP.on('zoomstart', function(event) {
      // 清除定时器
      util.clearTimeout(timer);
    });         
                          
  }else{
    MAP.on("rightclick", function (e) {
        contextMenuPositon = e.lnglat
        handlePointCreate(contextMenuPositon)
    });       
    
  }
  document
  .querySelector("#map-control-fullview")
  .addEventListener("click",(e)=>{
    MAP.setFitView();
  })

  document
  .querySelector("#map-control-location")
  .addEventListener("click",(e)=>{
    locator.getCurrentPosition(function(status,result){
        if(status=='complete'){
          MAP.setZoomAndCenter(14,result.position)
          contextMenuPositon = result.position
          createMarkers("temp")
        }else{
            
        }
    });
  })      
  MAP.setFitView();
}