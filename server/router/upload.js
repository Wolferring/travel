const config = require("../store/config.js")
const Router = require('koa-router')
const route = new Router()
const fs = require('fs')
const path = require('path')
const bcrypt = require("bcrypt")
const images = require('../store/image.js')
// const Client = require('@alicloud/imageaudit-2019-12-30')
// 创建实例
// 引入SDK
// const Client = require('@alicloud/imageenhan-2019-09-30');

// 创建实例
// const client = new Client({
//   accessKeyId: 'accessKeyId',
//   accessKeySecret: 'accessKeySecret',
//   securityToken: '', // 支持STS
//   endpoint: 'https://ocr.cn-shanghai.aliyuncs.com'
// });
// const client = new Client({
//   accessKeyId: config.ali.accessKeyId,
//   accessKeySecret: config.ali.accessKeySecret,
//   endpoint: 'https://imageenhan.cn-shanghai.aliyuncs.com'
// });
// client.makeSuperResolutionImage({
//         "Url": "https://viapi-demo.oss-cn-shanghai.aliyuncs.com/viapi-demo/images/ChangeImageSize/change-image-size-src.png"
// }, {timeout: 10000}).then(function (data) {
//   console.log('Result:' + data);
// }, function (err) {
//   console.log('Error:' + err);
// });
function randomString(len) {

　　return pwd;
}
const genName = (name)=>{
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  var maxPos = $chars.length;
  var pwd = '';
  for (i = 0; i < 16; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }  
  return (new Date().getTime())+pwd+`.${name.split(".").pop()}`
}
const saveFile = (file,ctx)=>{
    let fileName = genName(file.name)
    var destPath = path.join(__dirname,'../public/upload/'+ctx.state.user.id) + `/${fileName}`;
    var dest_Dir = path.join(__dirname,'../public/upload/'+ctx.state.user.id);  
    let finalPath = path.join('/public/upload/'+ctx.state.user.id) + `/${fileName}`;
    const reader = fs.createReadStream(file.path);
    return new Promise((resolve,reject)=>{
      fs.mkdir(dest_Dir, {recursive:true}, (err)=>{
         if (err) {
            reject(err)
         } else {
             // fs.rename(file.path, destPath, (err)=>{
             //    resolve(destPath)
             // });
            const upStream = fs.createWriteStream(destPath);
            // 可读流通过管道写入可写流
            reader.pipe(upStream)
            resolve(finalPath)
                        
         }
      })
    })
    // console.log(filePath)

}
const insertImages = async(query)=>{
  return images.insertImages(query)
}
route
// .get("/images",async (ctx,next)=>{
//   images.updateImagesPOI(42,ctx.state.user.id,[1,2,3,4])
//   ctx.body = {
//     status:1,
//     data:{}
//   }
// })
.post("/upload",async (ctx,next)=>{
  console.log(ctx.request.files)
  const user = ctx.state.user
  const files = ctx.request.files.files; // 获取上传文件
  let type = Object.prototype.toString.call(files)
  switch(type){
    case "[object Array]":
      let urls = [],
          query = []
      for (let file of files) {
        await saveFile(file,ctx)
        .then(res=>{
          if(res){
            urls.push({
              real_url:res,
              url:config.host+res
            })
            query.push([res,user.id])
          }
        })
      }
      let result = await insertImages(query)
      urls.map((item,index)=>{
        item["id"] = result.insertId+index
      })
      ctx.body = {
        status:1,
        data:urls
      }
      break;
    case "[object Object]":
        await saveFile(files,ctx)
        .then(async res=>{
          if(res){
            let result = await insertImages([[res,user.id]])
            ctx.body = {
              status:1,
              data:[{
                id:result.insertId,
                real_url:res,
                url:config.host+res
              }]
            }
          }
        })
        break;    
  }

})
module.exports = route


       