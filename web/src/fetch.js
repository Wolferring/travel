import axios from 'axios'

const api = (()=>{

  let apiurl = "https://travel.whimsylove.cn/api";

  if( (location.host).indexOf("travel")!=-1){
      apiurl ="//travel.whimsylove.cn/api";
  }

  const service = axios.create({//设置全局配置
      baseURL:`${apiurl}`, //请求路径
      timeout: 15000, // 请求超时时间
  })
  // 请求拦截器
  service.interceptors.request.use(
    config => {
      var AUTH = window.localStorage.getItem("AUTH")    
      if(AUTH){
          config.headers['Authorization'] ="Bearer "+ AUTH;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  )
   //响应拦截器,当有固定的响应状态状态码需要给用户特定的提示的时候
  service.interceptors.response.use(
      response => { 
        if(response.status==200&&response.data.status==1){
          return response.data
        }else if(response.data.status==-1){
          if(window.location.pathname!="/"){
            window.location.href="/"
          }
          return Promise.reject(response.data);
        }
        else{
          return Promise.reject(response);
        }
      },
      error => {
          if(error.response.data.status == '-1'){
          }
          return error;   
      }
  );  
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
export default api
