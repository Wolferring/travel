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
.get("/certify/family",async (ctx,next)=>{
    let family = await familyModel.findPendingRequestByUser(ctx.state.user.id)
    ctx.body={
        status:1,
        data:family
    }    
})
.get("/share/familyTicket",async (ctx,next)=>{
    let user = await userModel.findUserById(ctx.state.user.id)
    let wxActivity = await util.getWXActivity(user.openid)    
    // let family = await familyModel.findFamilyById(ctx.params.id,ctx.state.user.id)
    console.log(wxActivity)
    ctx.body={
        status:1,
        data:wxActivity.data
    }    
})
.post("/family/join",async (ctx,next)=>{
    let family = await familyModel.findFamilyById(ctx.request.body.family_id,ctx.state.user.id)
    if(!family.id){
        ctx.body={
            status:0,
            msg:"分享组不存在"
        }
        return false        
    }    

    let hasJoin = await familyModel.isFamilyJoined(ctx.request.body.family_id,ctx.state.user.id)

    if(hasJoin&&hasJoin.id){
        ctx.body={
            status:0,
            msg:"已经加入过分享组"
        }           
        return false  
    }
    

    let join = await familyModel.joinFamily(ctx.request.body.family_id,ctx.state.user.id)
    ctx.body={
        status:1,
        data:null
    }    
})
.post("/family/leave",async (ctx,next)=>{
    let hasJoin = await familyModel.isFamilyJoined(ctx.request.body.family_id,ctx.state.user.id)
    if(!hasJoin||!hasJoin.id){
        ctx.body={
            status:0,
            msg:"退出失败，未加入过该分享组"
        }
        return false          
    }
    let family = await familyModel.findFamilyById(ctx.request.body.family_id,ctx.state.user.id)
    if(ctx.state.user.id==family.owner){
        ctx.body={
            status:0,
            msg:"无法退出自己创建的分享组，请尝试删除"
        }
        return false         
    }
    let result = await familyModel.leaveFamily(ctx.request.body.family_id,ctx.state.user.id)
    ctx.body={
        status:1,
        data:null,
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
    // let comment = await commentModel.findCommentById(ctx.params.id)
    // console.log(comment,ctx.state.user.id)
    // if(comment&&comment.from_id==ctx.state.user.id){
    //     await commentModel.removeCommentById(ctx.params.id,ctx.state.user.id)
    //     .then(async(res)=>{
    //         ctx.body={
    //             status:1,
    //             data:{}
    //         }    
    //     })
    // }else{
    //     ctx.body={
    //         status:0,
    //         msg:"没有操作权限"
    //     }          
    // }

})
module.exports = route