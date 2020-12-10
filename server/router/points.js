const Router = require('koa-router')
const route = new Router()
const pointModel = require('../store/mysql.js');
route
.get("/points",async (ctx,next)=>{
    console.log("获取地点")
    const interestPoints = [
      {
        id:0,
        weight:0,
        lnglat:["104.059399","30.562253"],
        title:"成都",
        remark:"成都都成",
        address:"",
        dateTime:"",
        createTime:"",
        photos:[],
        people:[],
      },
      {
        id:1,
        weight:0,
        lnglat:["104.159399","30.562253"],
        title:"成都",
        remark:"成都都成",
        address:"",
        dateTime:"",
        createTime:"",
        photos:[],
        people:[],
      }      
    ]    
    let ps = await pointModel.findPoints()

    ctx.body={
        status:1,
        data:{
            points:ps
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
        point.dateTime
    ]) 
    .then(async(res)=>{
        let result = await pointModel.findPointsById(res.insertId)
        
        ctx.body={
            status:1,
            data:result
        }    
    })
})
module.exports = route