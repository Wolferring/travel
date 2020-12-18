



window.api = (()=>{

  let apiurl = "//192.168.42.1:3000";
  if( (location.host).indexOf("travel")!=-1){
      apiurl ="//travel.whimsylove.cn/api";
  }

  const service = axios.create({//设置全局配置
      baseURL:`${apiurl}`, //请求路径
      timeout: 0, // 请求超时时间
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
          return Promise.reject(response.data);
        }
        else{
          return Promise.reject(response);
        }
      },
      error => {
          // if(error.response.data.status == '-1'){
          //     //需要登录
          // }
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
    register(obj){ 
        return service({
            url:`/register`,
            method:'POST',
            data: obj
        })   
    }    
  } 
})()

