const wechat = require('../util/wechat')
const axios = require('axios')
const util = (()=>{
  return {
    realType:(val)=>{
      return Object.prototype.toString.call(val)
    },
    resolveImagePath:(path)=>{
      return "//cdn.whimsylove.cn"+path
    },
    sendCommentWXNotify:async (params)=>{
      const wxToken = await wechat.getAccessToken() 
      let query = params
      query.access_token = wxToken
      return axios.post('https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token='+wxToken,query)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });      
    }
  }
})()
module.exports = util