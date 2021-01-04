const Router = require('koa-router')
const route = new Router()
const config = require('../store/config.js')
const userModel = require('../store/user.js')
const token = require('../util/token.js')
const crypt = require('../util/crypt.js')
const util = require("../util/util.js")
route
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
    let user = await userModel.findRawUserByName(query.username)
    console.log(user)
    if(user&&crypt.decrypt(query.password,user.password)){
        let auth_token = await token.set(user)
        ctx.body={
            status:1,
            data:{
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
    await userModel.findUserByName(user.username)
    .then(async res=>{
        if(res&&res.username){
            ctx.body = {
                status: 0,
                msg: '用户名已经存在'
            }              
        }else{
            await userModel.insertUser([
                user.username,
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
        }
    })

})
.post("/user",async (ctx,next)=>{
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