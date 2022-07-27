const Router = require('koa-router')
const route = new Router()
const pointModel = require('../store/points.js');
const commentModel = require('../store/comments.js');
const userModel = require('../store/user.js')
const familyModel = require('../store/family.js')
const config = require("../store/config.js")
const path = require('path')
const token = require('../util/token.js')
const util  = require("../util/util.js")

route
.get("/family",async (ctx,next)=>{
    let family = await familyModel.findFamilyByUser(ctx.state.user.id) 
    if(family&&family.length){
        family.forEach(item=>{
            item.users = JSON.parse(item.users)
        })
    }
    ctx.body={
        status:1,
        data:family
    }    
})
.get("/family/:id",async (ctx,next)=>{
    let family = await familyModel.findFamilyById(ctx.params.id,ctx.state.user.id)
    if(family&&family.id){
        family.users = JSON.parse(family.users)
    }
    ctx.body={
        status:1,
        data:family
    }    
})
.post("/family/join",async (ctx,next)=>{
    let hasJoin = await familyModel.findFamilyByUser(ctx.state.user.id)
    if(hasJoin.length){
        ctx.body={
            status:0,
            msg:"已经加入过分享组"
        }           
        return false        
    }
    
    let family = await familyModel.findFamilyById(ctx.request.body.family_id,ctx.state.user.id)
    if(!family.id){
        ctx.body={
            status:0,
            msg:"分享组不存在"
        }           
        return false        
    }
    let join = await familyModel.joinFamily(ctx.request.body.family_id,ctx.state.user.id)
    ctx.body={
        status:1,
        data:family,
        res:join
    }    
})
.post("/family",async (ctx,next)=>{
    let family = await familyModel.findOwnedFamilyByUser(ctx.state.user.id)
    if(family.length>0){
        ctx.body={
            status:0,
            msg:"每个人只能创建一个分享组"
        }           
        return false
    }
    await familyModel.insertFamily(ctx.request.body.nickname,ctx.state.user.id) 
    .then(async(res)=>{     
        console.log(res)
        ctx.body={
            status:1,
            msg:"创建分享组成功"
        }    
    })
})
.put("/family/:id",async(ctx,next)=>{
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
.delete("/family/:id",async (ctx,next)=>{
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