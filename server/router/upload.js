const config = require("../store/config.js")
const Router = require('koa-router')
const route = new Router()
const fs = require('fs')
const path = require('path')
const bcrypt = require("bcrypt")
const images = require('../store/image.js')
const sharp = require('sharp')
let OSS = require('ali-oss'); 
const util = require("../util/util.js")

let client = new OSS({
  accessKeyId: config.ali.accessKeyId,
  accessKeySecret: config.ali.accessKeySecret,
  bucket: 'whimys-travel-images',
  secure:true,
  endpoint:config.ali.endpoint
});

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
const saveFile = async (file,ctx)=>{
    let fileName = genName(file.name,ctx.state.user.id)
    let destPath = path.join(__dirname,'../public/upload/'+ctx.state.user.id) + `/${fileName}`;
    let destThumbnailPath = path.join(__dirname,'../public/upload/'+ctx.state.user.id) + `/thumb_${fileName}`;
    let dest_Dir = path.join(__dirname,'../public/upload/'+ctx.state.user.id);  
    let finalPath = path.join('/public/upload/'+ctx.state.user.id) + `/${fileName}`;
    let finalThumbPath = path.join('/public/upload/'+ctx.state.user.id) + `/thumb_${fileName}`;
    const reader = fs.createReadStream(file.path);
    return new Promise(async (resolve,reject)=>{
      let result = await client.putStream(`/${ctx.state.user.id}/`+fileName, reader)
      let thumb = await client.processObjectSave(
        `/${ctx.state.user.id}/`+fileName,
        `/${ctx.state.user.id}/thumb_`+fileName,
        "image/auto-orient,1/resize,m_lfit,w_300/quality,Q_100",
        'whimys-travel-images'
      )
      resolve({
        url:`/${ctx.state.user.id}/`+fileName,
        thumb:`/${ctx.state.user.id}/thumb_`+fileName
      })  
      // fs.mkdir(dest_Dir, {recursive:true}, (err)=>{
      //    if (err) {
      //       reject(err)
      //    } else {
      //       const upStream = fs.createWriteStream(destPath);
      //       const upThumbStream = fs.createWriteStream(destThumbnailPath);
      //       // 可读流通过管道写入可写流
      //       var rotator = sharp()
      //       .rotate();
      //       var thumb = sharp()
      //       .rotate()
      //       .resize({width:400});
      //       reader.pipe(rotator).pipe(upStream)  
      //       reader.pipe(thumb).pipe(upThumbStream)  
      //       resolve({
      //         url:finalPath,
      //         thumb:finalThumbPath
      //       })            
      //    }
      // })
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
              real_url:res.url,
              url:res.url,
              thumb:res.thumb,
            })
            query.push([res.url,res.thumb,user.id])
          }
        })
      }
      let result = await insertImages(query)
      urls.map((item,index)=>{
        item["id"] = result.insertId+index
        item["url"] = util.resolveImagePath(item.url)
        item["thumb"] = util.resolveImagePath(item.thumb)      
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
            let result = await insertImages([[res.url,res.thumb,user.id]])
            ctx.body = {
              status:1,
              data:[{
                id:result.insertId,
                real_url:res.url,
                url:util.resolveImagePath(res.url),
                thumb:util.resolveImagePath(res.thumb),
              }]
            }
          }
        })
        break;    
  }

})
module.exports = route


       