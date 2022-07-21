const Router = require('koa-router')
const route = new Router()
const pointModel = require('../store/points.js');
const commentModel = require('../store/comments.js');
const userModel = require('../store/user.js')
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
    if(point&&point.scope!="public"&&ctx.state.user.id!=point.uid){
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
    await commentModel.insertComment([
        comment.content,
        ctx.state.user.id,
        comment.to_id,
        comment.pid,
        ctx.state.user.nickname||"",
        ctx.state.user.avatar||""  
    ]) 
    .then(async(res)=>{     
        let from = await userModel.findUserById(ctx.state.user.id)
        let to = await userModel.findUserById(comment.to_id)
        let point = await pointModel.findPointById(comment.pid,to.id)
        if(to.openId){
            util.sendCommentWXNotify({
                touser:to.openId,
                template_id:"SYnJ0O9IaRByBo-f491qlk-XA_yi_N8HYOdNCMYTQc0",
                page:`/pages/detail/detail?id=${comment.pid}&author=${to.nickname}`,
                data:{
                    "thing1":{value:point.title},
                    "thing2":{value:from.nickname},
                    "thing3":{value:comment.content},
                    "date4":{value:new Date().toLocaleString('zh-CN',{hour12:false})}
                },
                miniprogram_state:'formal',
                lang:'zh_CN'

            })   
        }
     
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
    let comment = await commentModel.findCommentById(ctx.params.id)
    console.log(comment,ctx.state.user.id)
    if(comment&&comment.from_id==ctx.state.user.id){
        await commentModel.removeCommentById(ctx.params.id,ctx.state.user.id)
        .then(async(res)=>{
            ctx.body={
                status:1,
                data:{}
            }    
        })
    }else{
        ctx.body={
            status:0,
            msg:"没有操作权限"
        }          
    }

})
module.exports = route