const Router = require('koa-router')
const route = new Router()
const pointModel = require('../store/points.js');
const imageModel = require('../store/image.js');
const familyModel = require('../store/family.js')
const config = require("../store/config.js")
const path = require('path')
const token = require('../util/token.js')
const PATH_EXP = new RegExp(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/);
const util  = require("../util/util.js")
const resolveImages = (imageStr)=>{
    let isString = util.realType(imageStr)==="[object String]"
    let isObject = util.realType(imageStr)==="[object Object]"
    let isArray = util.realType(imageStr)==="[object Array]"
    let images = imageStr
    if(isString){
        let str = (imageStr).replace(/'/g, '"').replace(/\\/g, '\/')
        if(!(/^\[[\w\W]*\]$/).test(str)){
            str = "["+str+"]"
        }
        images = JSON.parse(str)
    }
    if(isObject){
        images =[images]
    }
    if(isArray){
        images =images
    }    
    images.length&&images.forEach(item=>{
        item.url = "//cdn.whimsylove.cn"+item.url
        item.thumb = "//cdn.whimsylove.cn"+item.thumb
    })
    return images
}

route
.get("/points",async (ctx,next)=>{
    let $where = ctx.request.query
    let $sql = ''
    let keys = Object.keys($where)
    if(keys.length){
        keys.forEach(item=>{
            $sql+=` AND points.${item}='${$where[item]}' `
        })
    }
    
    let ps = await pointModel.findPoints(ctx.state.user.id,$sql)    
    if(ps&&ps.length){
        ps.forEach(poi=>{
            if(poi.images){
                poi.images = resolveImages(poi.images)
            }
        })    
    }
    ctx.body={
        status:1,
        data:{
            points:ps
        }
    }    
})
.get("/points/rand",async (ctx,next)=>{
    let ps = await pointModel.findPointByRandom(ctx.state.user.id)
    if(ps&&ps.images){
        ps.images = resolveImages(ps.images)
    }
    ctx.body={
        status:1,
        data:ps
    }    
})
.get("/points/family/:id",async (ctx,next)=>{
    let hasJoin = await familyModel.isFamilyJoined(ctx.params.id,ctx.state.user.id)
    // if(hasJoin.length){
    //     let join = hasJoin.some((i)=>{
    //         return i.id==ctx.params.id&&i.status=='ACTIVE'
    //     })
    //     if(!join){
    //         ctx.body={
    //             status:0,
    //             msg:"没有访问权限"
    //         }           
    //         return false  
    //     }
      
    // }
    console.log(hasJoin)
    if(!hasJoin){
        ctx.body={
            status:0,
            msg:"没有访问权限"
        }           
        return false        
    }    
    let ps = await pointModel.findPointsByFamily(ctx.params.id,ctx.state.user.id)
    if(Object.prototype.toString.call(ps)=="[object Object]"){
        ps = [ps]
    }
    if(ps&&ps.length){
        ps.forEach(poi=>{
            if(poi.images){
                poi.images = resolveImages(poi.images)
            }
        })    
    }
    ctx.body={
        status:1,
        data:{
            points:ps
        }
    }    
})
.get("/points/city",async (ctx,next)=>{
    let limit = ctx.request.query.limit||4
    let ps = await pointModel.findPointsGroupByCity(ctx.state.user.id,limit)
    if(Object.prototype.toString.call(ps)=="[object Object]"){
        ps = [ps]
    }
    if(ps&&ps.length){
        ps.forEach(poi=>{
            if(poi.images){
                poi.images = resolveImages(poi.images)
            }
        })    
    }
    ctx.body={
        status:1,
        data:{
            points:ps
        }
    }    
})
.get("/points/province",async (ctx,next)=>{
    let limit = ctx.request.query.limit||4
    let ps = await pointModel.findPointsGroupByProvince(ctx.state.user.id,limit)
    if(Object.prototype.toString.call(ps)=="[object Object]"){
        ps = [ps]
    }    
    if(ps&&ps.length){
        ps.forEach(poi=>{
            if(poi.images){
                poi.images = resolveImages(poi.images)
            }
        })    
    }
    ctx.body={
        status:1,
        data:{
            points:ps
        }
    }    
})
.get("/points/recent",async (ctx,next)=>{
    let pageSize = ctx.request.query.pageSize||4
    let pageNum = ctx.request.query.pageNum||1
    let ps = await pointModel.findPointsByTime(ctx.state.user.id,pageSize,pageNum)
    if(Object.prototype.toString.call(ps)=="[object Object]"){
        ps = [ps]
    }    
    if(ps&&ps.length){
        ps.forEach(poi=>{
            if(poi.images){
                poi.images = resolveImages(poi.images)
            }
        })    
    }
    ctx.body={
        status:1,
        data:{
            points:ps
        }
    }    
})
.get("/statistic",async (ctx,next)=>{   
    let ps = await pointModel.findPoints(ctx.state.user.id)||[],
        province = [],
        city = [];
    if(Object.prototype.toString.call(ps)=="[object Object]"){
        ps = [ps]
    }
    for(let i = 0;i<ps.length;i++){
        if(province.indexOf(ps[i].province)<0){
            province.push(ps[i].province)
        }
        if(city.indexOf(ps[i].city)<0){
            city.push(ps[i].city)
        }       
    }
    ctx.body={
        status:1,
        data:{
            total:ps.length,
            province:province,
            city:city
        }
    }    
})
.post("/points",async (ctx,next)=>{
    let point = ctx.request.body
    await pointModel.insertPoint([
        point.title,
        point.address,
        point.remark,
        point.lnglat.toString(),
        point.dateTime,
        point.province||point.city,
        point.city||point.province,
        point.scope||"public",
        ctx.state.user.id   
    ],ctx.state.user.id) 
    .then(async(res)=>{
        if(point.images&&point.images.length){
            let ids = point.images.map(item=>item.id)
            await imageModel.updateImagesPOI(res.insertId,ctx.state.user.id,ids)
        }
        let ps = await pointModel.findPointById(res.insertId,ctx.state.user.id)
        if(ps.images){
            ps.images = resolveImages(ps.images)
        }        
        ctx.body={
            status:1,
            data:ps
        }    
    })
})
.get("/points/:id",async (ctx,next)=>{
    let ps = await pointModel.findPointById(ctx.params.id,ctx.state.user.id)
    if(ps&&ps.images){
        ps.images = resolveImages(ps.images)
    }
    ctx.body={
        status:1,
        data:ps
    }    
})
.get("/points/shared/:id",async (ctx,next)=>{
    let ps = await pointModel.findSharedPointById(ctx.params.id)
    if(!ps){
        ctx.body={
            status:404,
            data:null
        }    
        return false     
    }
    if(ps&&ps.images){
        ps.images = resolveImages(ps.images)
    }
    let owned = false
    if(ctx.request.header&&ctx.request.header.authorization){
        let user = await token.verify(ctx.request.header.authorization)
        if(user.id==ps.uid){
            owned = true
        }
    }
    if(util.realType(ps)=="[object Object]"){
        ps.owned = owned
    }
    ctx.body={
        status:1,
        data:ps
    }    
})
.put("/points/:id",async(ctx,next)=>{
    let point = ctx.request.body
    await pointModel.updatePoint([
        point.title,
        point.remark,
        point.dateTime,
        point.scope
    ],
    ctx.params.id,
    ctx.state.user.id)  
    .then(async(res)=>{
        ctx.body={
            status:1,
            data:{}
        }    
    })       
})
.delete("/points/:id",async (ctx,next)=>{
    await pointModel.removePointsById(ctx.params.id,ctx.state.user.id)
    .then(async(res)=>{
        ctx.body={
            status:1,
            data:{}
        }    
    })

})
module.exports = route