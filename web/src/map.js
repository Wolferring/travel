import "./styles/style.less"
import {EventBus,GLOBAL_EVENT} from "./event.js"
import util from "./util.js"
import Upload from "./upload.js"
import api from "./fetch.js"
import PREVIEW from './preview.js'
import AUTH from './auth.js'
import point_icon from "./image/point.png"
import point_temp_icon from "./image/point-temp.png"
function isMobile (ua) {
  if (!ua && typeof navigator != 'undefined') ua = navigator.userAgent;
  if (ua && ua.headers && typeof ua.headers['user-agent'] == 'string') {
    ua = ua.headers['user-agent'];
  }
  if (typeof ua != 'string') return false;

  return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4));
}
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
          MAP.removeOverlay(TEMP_MARKER)
          // TEMP_MARKER.setMap(null)
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
          console.log(contextMenuPositon,contextMenuAddress)
          let formData = new FormData(form),
              params = {
                images:images,
                lnglat:[contextMenuPositon.lng,contextMenuPositon.lat],
                city:contextMenuAddress.addressComponents.city,
                province:contextMenuAddress.addressComponents.province
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
  api.getPoints()
  .then(result=>{
    initMap(result.data.points)
    BUS.emit("map:init")
  })        
}

//contextMenuPositon，右键点击的位置和地址
//contextMenuAddress
var TEMP_MARKER = null,
    contextMenuPositon = null,
    contextMenuAddress = null,
    MARKERS = [];//点标

BUS.on("marker:create",()=>{
  let p = MARKERS.map(item=>{
    return item.latLng
  })
  MAP.setViewport(p)  
}) 

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
  let button = util.createDom("<button class='point-remove button button-mini'>删除</button>")
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
      console.log(MAP.getOverlays())
      api.removePoint(poi.id)
      .then(res=>{
        MAP.getOverlays().forEach(item=>{
          if(item.infoWindow){
            MAP.removeOverlay(item)
          }
        })
        MAP.removeOverlay(MARKERS[markerIndex-1])
        // MAP.clearInfoWindow()
        BUS.emit("marker:remove")
      })
    }
  })
}
var markerClick = (info,poi,point) => {
  var pointDetailWindow = new BMapGL.InfoWindow("",{
    width:400,
    height:0,
    offset: new BMapGL.Size(0, -30)
  })  
  if(isMobile()){
    pointDetailWindow.on("open",()=>{
      USER_WIDGET.hide()
    }) 
    pointDetailWindow.on("close",()=>{
      USER_WIDGET.show()
    })                
  }    
  let images = info.querySelectorAll(".point-images img")
  if(images&&images.length){
    for(let image of images){
      if(!image.src){
        image.src = image.getAttribute("data-src")
      }
    }
  }
  pointDetailWindow.setContent(info);
  MAP.openInfoWindow(pointDetailWindow,point);
  pointDetailWindow.redraw()

}      
var createMarkers = (types)=>{
  const NormalIcon = new BMapGL.Icon(point_icon,new BMapGL.Size(30, 30),{
      imageSize: new BMapGL.Size(30, 30),
  }); 
  const TempIcon = new BMapGL.Icon(point_temp_icon,new BMapGL.Size(30, 30),{
    imageSize: new BMapGL.Size(30, 30),
  });        
  let realType = Object.prototype.toString.call(types)
  switch(realType){
    case "[object String]" :
      if(types=="temp"){
        try{
          MAP.removeOverlay(TEMP_MARKER)
          TEMP_MARKER = null
        }catch(e){}
        console.log(contextMenuPositon)
        let point = new BMapGL.Point(contextMenuPositon.lng, contextMenuPositon.lat)
        var marker = new BMapGL.Marker(point,{
          offset:new BMapGL.Size(0, -22),
          icon:TempIcon
        });
        marker.addEventListener('click', ()=>{
          MAP.removeOverlay(marker)
          FORM.close()
        });
        TEMP_MARKER = marker
        MAP.addOverlay(marker)
        return TEMP_MARKER
      }
      break;
    case "[object Array]" :
      for (let i = 0; i < types.length; i++) {
        let point = new BMapGL.Point(types[i]['lnglat'].split(",")[0], types[i]['lnglat'].split(",")[1])
        let marker = new BMapGL.Marker(point,{
          offset:new BMapGL.Size(0,-22),
          icon:NormalIcon
        });          
        MARKERS.push(marker)
          let content = createMarkerContent(types[i]);
          marker.addEventListener('click', function(){
            markerClick(content,types[i],point)
          });
          MAP.addOverlay(marker)
      }        
      break;
    case "[object Object]" :
      let point = new BMapGL.Point(types['lnglat'].split(",")[0], types['lnglat'].split(",")[1])

      var marker = new BMapGL.Marker(point,{
        offset:new BMapGL.Size(0,-22),
        icon:NormalIcon
      });
      MARKERS.push(marker)
      let content = createMarkerContent(types);
      marker.addEventListener('click', function(){
        markerClick(content,types,point)
      });
      MAP.addOverlay(marker)     
      break;          
  }
  BUS.emit("marker:create")

}

var initMap = (interestPoints)=>{
  var BDMAP = new BMapGL.Map("map-container",{
    minZoom:3,
    maxZoom:15
  })
  BDMAP.enableScrollWheelZoom(true)
  if(util.isDarkMode){
    BDMAP.setMapStyleV2({     
      styleId: '7ef7a482d4981a02b419e8d91ccaf185'
    })
  }
  BDMAP.loadMapStyleFiles(()=>{
    // alert(1)
  })  
  // BDMAP.centerAndZoom(new BMapGL.Point(116.404, 39.915), 10);  


    
  window.MAP = BDMAP
  //创建POI详情

  //创建经纬度解码器  
  const geocoder = new BMapGL.Geocoder()
  const locator = new BMapGL.Geolocation()
  
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
    const BDSearch= new BMapGL.Autocomplete({
      input:"poi-search-input",
      "location":MAP
    });
    BDSearch.addEventListener("onconfirm",function(e){
      console.log(e)
      let _value = e.item.value
      if(_value){
        let address  = _value.province +  _value.city +  _value.district +  _value.street +  _value.business; 
        geocoder.getPoint(address,function(p){
          console.log(p)
          MAP.centerAndZoom(new BMapGL.Point(p.lng,p.lat),13);
          contextMenuPositon = p
          handlePointCreate(contextMenuPositon)        
        })
      }
    })
    // 根据关键字进行搜索
    // const renderResult = (result)=>{
    //   searchResultDom.innerHTML = ""
    //   result.forEach(item=>{
    //     let resultItemDom = util.createDom(`<div class="search-item">${item.name}</div>`)
  
    //     searchResultDom.appendChild(resultItemDom)
    //     resultItemDom.addEventListener("click",()=>{
    //       MAP.setZoomAndCenter(13, [item.location.lng,item.location.lat]);
    //       contextMenuPositon = item.location
    //       handlePointCreate(contextMenuPositon)        
    //     })      
    //   })
    // }
    // let timer = null
    // document.querySelector("#poi-search-input").addEventListener("keydown",function(){
    //   clearTimeout(timer)
    // })
    // document.querySelector("#poi-search-input").addEventListener("input",function(ev){
    //   timer = setTimeout(function(){
    //     let words = ev.target.value
    //     let result = []
    //     BDSearch.search(words)          
    //   },500)
   
    // })
  }  
  createSearch()
  //创建地图右键菜单
  // var contextMenu = new BMapGL.ContextMenu()
  // //右键添加Marker标记
  // contextMenu.addItem("添加标记", function (e) {
  //     var marker = createMarkers("temp")
  //     FORM.open()
  //     contextMenu.close()
  // }, 0);    
  const createSelect = (options,dom)=>{
    let html = ``
    for(let opt of options){
      html+=`<option value="${opt.title}">${opt.title}</option>`
    }
    dom.innerHTML = html
  }
  //地图绑定鼠标右击事件——弹出右键菜单
  var handlePointCreate = (position)=>{
    geocoder.getLocation(position, function(result) {
      console.log(result)
      if (result) {
          contextMenuAddress = result
          if(!contextMenuAddress.surroundingPois.length){
            contextMenuAddress.surroundingPois.push({
              title:result.address
            })
          }
          createSelect(contextMenuAddress.surroundingPois,document.querySelector("#point-form-container select[name='address']"))
          var marker = createMarkers("temp")
          FORM.open()               
          // // contextMenu.open(MAP, position);
          // if(AMap.Browser.mobile){
          // }else{
          // }
      }else{
        util.toast('根据经纬度查询地址失败')
      }
    },{
      poiRadius:1000,
      numPois:15
    });           
  }
  if(isMobile()){
    let timer = []
    let t = 0
    MAP.addEventListener('touchstart', function(event) {
      // 清除默认行为
      // event.preventDefault();
      // 开启定时器
      if(timer) clearTimeout(timer);
      timer.push(setTimeout(() => {
        contextMenuPositon = event.lnglat
        handlePointCreate(contextMenuPositon)
      }, 700));
    });  
    MAP.addEventListener('touchend', function(event) {
      // 清除定时器
      util.clearTimeout(timer);
    }); 
    MAP.addEventListener('touchmove', function(event) {
      // 清除定时器
      util.clearTimeout(timer);
    }); 
    MAP.addEventListener('zoomstart', function(event) {
      // 清除定时器
      util.clearTimeout(timer);
    });         
                          
  }else{
    MAP.addEventListener("rightclick", function (e) {
        contextMenuPositon = e.latlng
        handlePointCreate(contextMenuPositon)
    });       
    
  }
  document
  .querySelector("#map-control-fullview")
  .addEventListener("click",(e)=>{
    let p = MARKERS.map(item=>{
      return item.latLng
    })
    MAP.setViewport(p) 
  })

  document
  .querySelector("#map-control-location")
  .addEventListener("click",(e)=>{
    locator.getCurrentPosition(function(result){
      console.log(status)
      MAP.centerAndZoom(result.point,14)
      contextMenuPositon = result.point
      createMarkers("temp")
    });
  })      
  // MAP.setFitView();
}