const util = require("./util")

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
  const service = (c)=>{
    let config = Object.assign({auth:true},c)
    let AUTH = wx.getStorageSync("AUTH")
    let header = {}
    if(AUTH&&AUTH.length){
      header["Authorization"] = "Bearer "+ AUTH
    }
    return new Promise(function(resolve,reject){
      wx.request({
        url: `${apiurl}${config.url}`,
        data:config.data||config.params,
        method:config.method||"get",
        header:header,
        success:function(res){
          if(res.statusCode=="200"&res.data.status==1){
            resolve(res.data)
          }else if(res.data.status==-1&&config.auth){
            util.openLogin()
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
          params: query,
          auth:false
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
    getPointByRand(query){
      return service({
        url:`/points/rand`,
        method:'GET',
        params: query,
        auth:false
      })      
    },    
    getPointsStatistic(){
        return service({
            url:`/statistic`,
            method:'GET'
        })
    },  
    getSharedPoint(id){
      return service({
          url:`/points/shared/${id}`,
          method:'get'
      })        
    },   
    getPointComments(query){
      return service({
        url:`/comments`,
        method:'GET',
        params: query,
        auth:false
      })        
    },    
    createComment(obj){
      return service({
          url:`/comment`,
          method:'POST',
          data: obj
      })        
    },    
    removeComment(id){
      return service({
        url:`/comment/${id}`,
        method:'DELETE'
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
    updatePoint(id,data){
      return service({
          url:`/points/${id}`,
          method:'put',
          data:data
      })        
    },    
    getUserInfo(){
        return service({
            url:`/user`,
            method:'GET',
            auth:false
        })      
    },    
    login(obj){ 
        return service({
            url:`/login`,
            method:'POST',
            data: obj
        })   
    },
    uploadPath(){
      return apiurl+"/upload"
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
    sendRegisterSMS(query){
      return service({
        url:`/sms/r`,
        method:'GET',
        params: query
      })        
    },
    sendLoginSMS(query){
      return service({
        url:`/sms/l`,
        method:'GET',
        params: query
      })        
    },    
    register(obj){ 
        return service({
            url:`/register`,
            method:'POST',
            data: obj
        })   
    },
    loginWX(code){
      return service({
        url:`/login/wx`,
        method:'POST',
        data: {
          code:code
        }
      })  
    },    
    bindWX(code){
      return service({
        url:`/bindWX`,
        method:'POST',
        data: {
          code:code
        }
      })  
    },
    createFamily(data){
      return service({
        url:`/family`,
        method:'POST',
        data: data
      })  
    },    
    getFamily(){
      return service({
        url:`/family`,
        method:'GET'
      })         
    },    
    getFamilyDetail(id){
      return service({
        url:`/family/`+id,
        method:'GET'
      })         
    },   
    getFamilyPoints(id){
      return service({
        url:`/points/family/`+id,
        method:'GET'
      })         
    },  
    getFamilyCertify(){
      return service({
        url:'/certify/family',
        method:'GET'
      })         
    }, 
    familyCertify(data){
      return service({
        url:`/certify/family`,
        method:'POST',
        data: data
      })        
    },
    refuseFamilyCertify(data){
      return service({
        url:`/refuse/family`,
        method:'POST',
        data: data
      })         
    },         
    getShareFamilyTicket(){
      return service({
        url:'/share/familyTicket',
        method:'GET'
      })         
    },       
    getRandomCover(query){
      return service({
        url:`/points/rand`,
        method:'GET'
      })         
    },
    joinFamily(id){
      return service({
        url:`/family/join`,
        method:'POST',
        data: {
          family_id:id
        }
      })      
    },
    leaveFamily(id){
      return service({
        url:`/family/leave`,
        method:'POST',
        data: {
          family_id:id
        }
      })      
    }, 
    removeFamilyMember(fid,uid){
      return service({
        url:`/family/leave`,
        method:'DELETE',
        data: {
          family_id:fid,
          uid:uid
        }
      })      
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
