const api = (()=>{

  let apiurl = "https://travel.whimsylove.cn/api";

  Promise.prototype.finally = function (cb) {
    const P = this.constructor;
    return this.then(
      (value) => P.resolve(cb()).then(() => value),
      (reason) =>
        P.resolve(cb()).then(() => {
          throw reason;
        })
    );
  };
  const service = (config)=>{
    var AUTH = wx.getStorageSync("AUTH")
    return new Promise(function(resolve,reject){
      wx.request({
        url: `${apiurl}${config.url}`,
        data:config.data||config.params,
        method:config.method||"get",
        header:{
          "Authorization":"Bearer "+ AUTH
        },
        success:function(res){
          if(res.statusCode=="200"&res.data.status==1){
            resolve(res.data)
          }else if(res.data.status==-1){
            wx.navigateTo({
              url: '/pages/login/login',
            })
            reject(res.data);
          }else{
            reject(res.data);
          }
        },
        fail:function(res){
          reject(res)
        },

      })
    })
  }
  return {
    getPoints(query){
      return service({
          url:`/points`,
          method:'GET',
          params: query
      })
    },
    getPointsByCity(query){
      return service({
          url:`/points/city`,
          method:'GET',
          params: query
      })
    },    
    getPointsByTime(query){
      return service({
        url:`/points/recent`,
        method:'GET',
        params: query
      })      
    },
    getPointsStatistic(){
        return service({
            url:`/statistic`,
            method:'GET'
        })
    },    
    createPoint(obj){
        return service({
            url:`/points`,
            method:'POST',
            data: obj
        })        
    },
    removePoint(id){
        return service({
            url:`/points/${id}`,
            method:'DELETE'
        })        
    },
    getUserInfo(){
        return service({
            url:`/user`,
            method:'GET'
        })      
    },    
    login(obj){ 
        return service({
            url:`/login`,
            method:'POST',
            data: obj
        })   
    },
    upload(obj){
      return service({
        url:`/upload`,
        headers:{'Content-Type':'multipart/form-data'},
        method:'POST',
        data: obj        
      })
    },
    updateUser(obj){
      return service({
          url:`/user`,
          method:'POST',
          data: obj
      })       
    },
    register(obj){ 
        return service({
            url:`/register`,
            method:'POST',
            data: obj
        })   
    },
    getRandomCover(query){
      return service({
        url:`/points/rand`,
        method:'GET'
      })         
    },
    getBing(){
      return axios.get(
        "https://api.vvhan.com/api/bing?type=json"
      )
      
    }, 
    getOneWord(){
      return axios.get(
        "http://api.tianapi.com/one/index",
        {
          params:{
            key:"f7c94591ae5c169ff470d8fb64cda300",
            rand:"1"
          }
        }
      )
      
    },        
  } 
})()
module.exports = api
