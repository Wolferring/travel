const Router = require('koa-router')
const route = new Router()
route
.get("/points",(ctx,next)=>{
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
    ctx.body={
        status:1,
        data:{
            points:interestPoints
        }
    }    
})
.post("/points",(ctx,next)=>{
    console.log("新建地点")
    console.log(ctx.request.body)
    const point = ctx.request.body
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
    ctx.body={
        status:1,
        data:{
            id:2,
            weight:0,
            lnglat:point.lnglat,
            title:point.title,
            remark:point.remark,
            address:point.address,
            dateTime:point.dateTime,
            createTime:new Date().getTime(),
            photos:[],
            people:[],
        } 
    }    
})
module.exports = route