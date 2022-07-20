const Router = require('koa-router')
const route = new Router()
const config = require('../store/config.js')
const userModel = require('../store/user.js')
const token = require('../util/token.js')
const crypt = require('../util/crypt.js')
const util = require("../util/util.js")
const Dysmsapi20170525  =  require('@alicloud/dysmsapi20170525');
// 依赖的模块可通过下载工程中的模块依赖文件或右上角的获取 SDK 依赖信息查看
const $OpenApi  =  require('@alicloud/openapi-client');

const SMSConfig = new $OpenApi.Config({
    accessKeyId: config.ali.accessKeyId,
    accessKeySecret: config.ali.accessKeySecret,
    endpoint:"dysmsapi.aliyuncs.com"
});
const client = new Dysmsapi20170525.default(SMSConfig)

const getRand = (min,max)=>{
    return Math.floor(Math.random()*(max-min))+min;
}
const validPhone = (phone)=>{
    const reg_tel = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
    return reg_tel.test(phone)
}
route
.get("/sms/r",async (ctx)=>{
    let randCode = getRand(1000,9989),
        phone = ctx.request.query.phone;
    let query = {
        code:randCode
    }
    if(!validPhone(phone)){
        ctx.body = {
            status:0,
            msg:"手机号不合法"
        } 
        return false             
    }
    let hasUser = await userModel.findUserByPhone(phone)
    if(hasUser&&hasUser.id){
        ctx.body = {
            status:0,
            msg:"手机号已经注册"
        } 
        return false        
    }
    let validCode = await userModel.findSMSByPhone(phone)
    if(validCode&&new Date().getTime()- new Date(validCode.create_time).getTime()<60000){
        ctx.body = {
            status:0,
            msg:"发送频率过快"
        } 
        return false
    }
    const SentSMS = new Dysmsapi20170525.SendSmsRequest({
        signName:"途纪",
        phoneNumbers:phone,
        templateCode:"SMS_246355004",
        templateParam:JSON.stringify(query)
    })
    try{
        const response = await client.sendSms(SentSMS)
        if(response.body.code=="OK"){
            userModel.insertSMS([randCode,phone,"register",response.body.bizId])
            ctx.body = {
                status:1,
                msg:"短信发送成功"
            }
        }else{
            ctx.body = {
                status:0,
                msg:response.body.message
            }            
        }
    }catch(e){    
    }
})
.get("/user",async (ctx,next)=>{
    let user = await userModel.findUserById(ctx.state.user.id)
    if(user){
        user.avatar = util.resolveImagePath(user.avatar)
        ctx.body={
            status:1,
            data:user
        }    
    }else{
      ctx.body = {
        status: -1,
        msg: "token无效需要登录"
      }          
    }
})
.post("/login",async (ctx,next)=>{
    let query = ctx.request.body
    let user = await userModel.findRawUserByPhone(query.username)
    if(user&&crypt.decrypt(query.password,user.password)){
        let auth_token = await token.set(user)
        ctx.body={
            status:1,
            data:{
                phone:user.phone,
                username:user.username,
                nickname:user.nickname,
                avatar:user.avatar,
                token:auth_token    
            }
        } 

    }else{
        ctx.body = {
            status: 0,
            msg: '用户名密码不匹配'
        }        
    }
})
.post("/register",async (ctx,next)=>{
    let user = ctx.request.body
    if(!validPhone(user.phone)){
        ctx.body = {
            status:0,
            msg:"手机号不合法"
        } 
        return false             
    }    
    let hasUser = await userModel.findUserByPhone(user.phone)
    if(hasUser&&hasUser.id){
        ctx.body = {
            status:0,
            msg:"手机号已经注册"
        } 
        return false        
    }    
    let validCode = await userModel.findSMSByPhone(user.phone)
    if(!validCode){
        ctx.body ={
            status:0,
            msg:"请发送并填写验证码"
        }
        return false        
    }
    //判断注册时提交的短信验证码是否过期
    if(validCode&&new Date().getTime()- new Date(validCode.create_time).getTime()>300000){
        ctx.body ={
            status:0,
            msg:"短信验证码已经过期"
        }
        return false
    }
    //判断注册时提交的短信验证码是否正确
    if(validCode&&(user.code!=validCode.code)){
        ctx.body ={
            status:0,
            msg:"短信验证码无效"
        }
        return false
    }    
    await userModel.insertUser([
        user.phone,
        crypt.encrypt(user.password),
        user.nickname||"",
        user.avatar||""
    ])
    .then(async res=>{
        let userData = await userModel.findUserById(res.insertId)
        userData['token'] = await token.set(userData)
        ctx.body = {
            status: 1,
            data:userData
        }            
    })
    next()
})
.put("/user",async (ctx,next)=>{
    await userModel.updateUser(ctx.state.user.id,ctx.request.body)
    .then(async(res)=>{
        ctx.body={
            status:1,
            data:{}
        }    
    })
})
.delete("/user/:id",async (ctx,next)=>{
    // await pointModel.removePointsById(ctx.params.id)
    // .then(async(res)=>{
    //     ctx.body={
    //         status:1,
    //         data:{}
    //     }    
    // })

})
module.exports = route