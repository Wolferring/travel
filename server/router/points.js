const Router = require('koa-router')
const route = new Router()
const pointModel = require('../store/points.js');
route
.get("/points",async (ctx,next)=>{
    console.log("获取地点")    
    let ps = await pointModel.findPoints()
    ctx.body={
        status:1,
        data:{
            points:ps
        }
    }    
})
.get("/statistic",async (ctx,next)=>{   
    let ps = await pointModel.findPoints(),
        province = [],
        city = []
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
    console.log("新建地点")
    let point = ctx.request.body
    // let point = {
    //     weight:0,
    //     lnglat:["104.059399","30.562253"],
    //     title:"成都",
    //     remark:"成都都成",
    //     address:"",
    //     dateTime:"",
    //     createTime:"",
    //     photos:[],
    //     people:[],
    // }   
    await pointModel.insertPoint([
        point.title,
        point.address,
        point.remark,
        point.lnglat.toString(),
        point.dateTime,
        point.province,
        point.city
    ]) 
    .then(async(res)=>{
        let result = await pointModel.findPointsById(res.insertId)
        ctx.body={
            status:1,
            data:result
        }    
    })
})
.delete("/points/:id",async (ctx,next)=>{
    await pointModel.removePointsById(ctx.params.id)
    .then(async(res)=>{
        ctx.body={
            status:1,
            data:{}
        }    
    })

})
module.exports = route