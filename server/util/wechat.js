const wxConfig = require('../store/config.js')
const fs = require('fs')
const path = require('path')
const sha1 = require('sha1')
const axios = require('axios')

function Wechat(){
    this.appId = wxConfig.wechat.appid,
    this.appSecret = wxConfig.wechat.secret,
    this.token = wxConfig.secret
}

//校验请求是否来自微信
Wechat.prototype.init = async function(req, res, next) {
    var token = wxConfig.secret
    var signature = req.query.signature
    var nonce = req.query.nonce
    var timestamp = req.query.timestamp
    var echostr = req.query.echostr
    var str = [token, timestamp, nonce].sort().join('')
    var sha = sha1(str)

    if (sha === signature) {
        next()
    }else{
        res.send('error')
    }

};

//获取access_token
Wechat.prototype.getAccessToken = async function(){
    var data = fs.readFileSync(path.resolve(__dirname, './token.txt'))
    try{
        accessToken = JSON.parse(data)
        if(accessToken.expires_in > Date.parse(new Date())){
            return Promise.resolve(accessToken.access_token)
        }else{
            //已过期
            return this.updateAccessToken()
        }
    }
    catch(err){
        //文件为空
        return this.updateAccessToken()
    }
}

//从微信重新拉取access_token
Wechat.prototype.updateAccessToken = async function(){
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`

    return new Promise((resolve, reject) => {
        axios.get(url)
        .then(res=>{
            console.log(res.data)
            var accessToken = res.data
            accessToken['expires_in'] = Date.parse(new Date())+((7200 - 20)*1000)
            fs.writeFileSync(path.resolve(__dirname, './token.txt') , JSON.stringify(accessToken))
            resolve(accessToken.access_token)            
        })        
    })
}


module.exports = new Wechat()