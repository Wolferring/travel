var AUTH = window.localStorage.getItem("AUTH")


let apiurl = "//localhost:3000";

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
    if(AUTH){
        config.headers['Authorization'] = token;
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
      }else{
        return Promise.reject(response);
      }
    },
    error => {
        if(error.response.data.status == '2'){
            //需要登录
        }
        return error;   
    }
);
window.api = {
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
    login(obj){ 
        return service({
            url:`/token/get`,
            method:'POST',
            data: obj
        })   
    }
} 
