const Router = require('koa-router')
const route = new Router()
const pointModel = require('../store/points.js');
const commentModel = require('../store/comments.js');

const config = require("../store/config.js")
const path = require('path')
const token = require('../util/token.js')
const util  = require("../util/util.js")

route
.get("/comments",async (ctx,next)=>{
    if(!ctx.request.query.pid){
        ctx.body={
            status:0,
            msg:"pid无效"
        } 
        return false        
    }
    let point = await pointModel.findPointStateById(ctx.request.query.pid) 
    if(point&&point.scope!="public"){
        ctx.body={
            status:0,
            msg:"没有查看权限"
        } 
        return false
    }  
    let comments = await commentModel.findCommentsByPid(ctx.request.query.pid)
    ctx.body={
        status:1,
        data:comments
    }    
})
.post("/comment",async (ctx,next)=>{
    let comment = ctx.request.body
    console.log(ctx.state)
    await commentModel.insertComment([
        comment.content,
        ctx.state.user.id,
        comment.to_id,
        comment.pid,
        ctx.state.user.nickname||"",
        ctx.state.user.avatar||""  
    ]) 
    .then(async(res)=>{     
        ctx.body={
            status:1,
            msg:"评论完成"
        }    
    })
})
.put("/comment/:id",async(ctx,next)=>{
    // let point = ctx.request.body
    // await pointModel.updatePoint([
    //     point.title,
    //     point.remark,
    //     point.dateTime,
    //     point.scope
    // ],
    // ctx.params.id,
    // ctx.state.user.id)  
    // .then(async(res)=>{
    //     ctx.body={
    //         status:1,
    //         data:{}
    //     }    
    // })       
})
.delete("/comment/:id",async (ctx,next)=>{
    // await pointModel.removePointsById(ctx.params.id,ctx.state.user.id)
    // .then(async(res)=>{
    //     ctx.body={
    //         status:1,
    //         data:{}
    //     }    
    // })

})
module.exports = route