const wechat = require('../util/wechat')
const axios = require('axios')
const util = (()=>{
  return {
    formateDate:(date, fmt)=>{
      if (typeof date == 'string') {
        return date;
      }
    
      if (!fmt) fmt = "yyyy-MM-dd hh:mm:ss";
    
      if (!date || date == null) return null;
      var o = {
        'M+': date.getMonth() + 1, // 月份
        'd+': date.getDate(), // 日
        'h+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds(), // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        'S': date.getMilliseconds() // 毫秒
      }
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
      for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
      }
      return fmt
    },
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