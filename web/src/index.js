import "./styles/style.less"
import {EventBus} from "./event.js"
import util from "./util.js"
import Upload from "./upload.js"
import api from "./fetch.js"
import PREVIEW from './preview.js'

import point_icon from "./image/point.png"
import point_temp_icon from "./image/point-temp.png"

const BUS = new EventBus();
window.onload = ()=>{
    USER.refresh()
    .then(()=>{
      initApplication()
    })    
    document
    .querySelector("#point-form-submit")
    .addEventListener("click",(e)=>{
      FORM.submit()
    })
    document
    .querySelector("#login-form-submit")
    .addEventListener("click",(e)=>{
      USER.login()
      .then(res=>{
        initApplication()
      })
    }) 
    document
    .querySelector("#register-form-submit")
    .addEventListener("click",(e)=>{
      USER.register()
      .then(res=>{
        initApplication()
      })
    })     
}

window.USER = (()=>{
  let loginForm = document.querySelector("#login-form"),
      registerForm = document.querySelector("#register-form"),
      dom = document.querySelector("#login-form-container"),
      userDetail = {}
  return {
    refresh:()=>{
      return new Promise((resolve,reject)=>{
        api.getUserInfo()
        .then(res=>{
            userDetail = res.data
            USER.close()
            resolve(userDetail)
        })
        .catch(e=>{
          if(e.status==-1){
            USER.open()
          }
          reject(e)
        })            
        
      })
    },
    open:()=>{
      dom.classList.add("active")
    },
    close:()=>{
      loginForm.reset()
      dom.classList.remove("active")
    },
    switch:()=>{
      dom.classList.toggle("register")
    },
    info:(key)=>{
      if(key&&Object.prototype.hasOwnProperty.call(userDetail,key)) 
        return userDetail[key]
      return userDetail
    },
    register:()=>{
      if(!util.valid("#register-form")) return Promise.reject("表单验证失败")

      let formData = new FormData(registerForm),
          params = {};
      formData.forEach((v,k)=>{
        params[k] = v
      })
      return api.register(params)
      .then(res=>{
          try{
            window.localStorage.setItem("AUTH",res.data.token)
          }catch(e){}
          userDetail = res.data
          USER.refresh()
          USER.close()
      })             
    },
    login:()=>{
      if(!util.valid("#login-form")) return Promise.reject("表单验证失败")

      let formData = new FormData(loginForm),
          params = {};
      formData.forEach((v,k)=>{
        params[k] = v
      })
      return new Promise((resolve,reject)=>{
        api.login(params)
        .then(res=>{

          try{
            window.localStorage.setItem("AUTH",res.data.token)
          }catch(e){}
          userDetail = res.data
          resolve()
          USER.refresh()
          USER.close()
        }) 
        .catch(e=>{
            util.toast(e.data.msg,{
              type:"error"
            })
            reject()
        })             
      })

    },
    logout:(e)=>{
      util.confirm("确认退出登录",{
        fitEl:e.target||null
      })
      .then((confirm)=>{
        if(confirm){
          window.localStorage.removeItem("AUTH")
          window.location.reload()
        }
      })
    }
  }
})()

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
          let html = `
          <div class="flex-start">
            <div class="avatar ${USER.info("avatar")?"":"hidden"}">
              <img src="${USER.info("avatar")}"  alt="用户头像"/>
            </div>
            <div class="info">
              <h4>${USER.info('nickname')}</h4>  
              <p>${USER.info('username')}</p>
              <p>${new Date(USER.info('create_time')).format("yyyy-MM-dd")}加入</p>
              
            </div>
            <div>
              <button class="button button-mini" onclick="USER.logout(event)">注销</button>
            </div>
          </div> 
          <div class="items" onclick="STATISTIC.open()">
            <span><b>${res.data.total||0}</b>个地点</span>  
            <span><b>${res.data.province.length}</b>个省</span>
            <span><b>${res.data.city.length}</b>个城市</span>
          </div>`
          dom.innerHTML = html
          USER_WIDGET.show()
        })
      }
    }
})()
var FORM = (()=>{
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
  });
  createMarkers(interestPoints)
  //创建点标
  //创建搜索
  var poiSearch = new AMap.AutoComplete({
    input:"poi-search-input",
    city:"成都"
  })
  poiSearch.on("select", (e)=>{
    if(e.poi.location){
      
      MAP.setZoomAndCenter(13, [e.poi.location.lng,e.poi.location.lat]);
      contextMenuPositon = e.poi.location
      handlePointCreate(contextMenuPositon)
    }
  })
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
  //地图绑定鼠标右击事件——弹出右键菜单
  var handlePointCreate = (position)=>{
    geocoder.getAddress(position, function(status, result) {
      if (status === 'complete'&&result.regeocode) {
          var address = result.regeocode;
          window.contextMenuAddress = address
          createSelect(address.pois,document.querySelector("#point-form-container select[name='address']"))
          var marker = createMarkers("temp")
          FORM.open()               
          // // contextMenu.open(MAP, position);
          // if(AMap.Browser.mobile){
          // }else{
          // }
      }else{
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