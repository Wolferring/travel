const Koa = require('koa');
const app = new Koa();
const registerRouter = require('./router/index.js')
const cors = require('koa-cors');
const koaBody = require('koa-body')
const koajwt = require('koa-jwt')
const config = require('./store/config.js')
const AUTH = require('./util/token.js')
const path = require('path')
const staticFiles = require('koa-static')
// app.use(async(ctx)=>{
//     let url =ctx.url;
 
//     //从request中获取GET请求
//     let request =ctx.request;
//     let req_query = request.query;
//     let req_querystring = request.querystring;
 
//     //从上下文中直接获取
//     let ctx_query = ctx.query;
//     let ctx_querystring = ctx.querystring;
 
//     ctx.body={
//         url,
//         req_query,
//         req_querystring,
//         ctx_query,
//         ctx_querystring
//     }
// });
app.use(cors({
    origin:"*"
}));
app.use(koaBody({
    multipart: true,
    formidable: {
        maxFileSize: 2000*1024*1024    // 设置上传文件大小最大限制，默认2M
    }
}));
app.use(async(ctx, next)=> {
    var token = ctx.headers.authorization;
    if(!token){
        // await next()        
    }else{
        AUTH.verify(token)
        .then(async res=>{

        })
        .catch(e=>{
          ctx.body = {
            status: -1,
            msg: "token无效需要登录"
          }            
        })
    }
    await next();
})
app.use(async (ctx, next) => {
  return next().catch((err) => {
    if (err.status === 401) {
      ctx.body = {
        status: -1,
        msg: "需要登录"
      } 
    } else {
      throw err;
    }
  })
});
app.use(koajwt({ secret: config.secret }).unless({
  // 登录接口不需要验证
  path: [/^\/sms/,/^\/login/,/^\/register/,/^\/test/,/^\/points\/shared\/\d{1,}/]
}))
app.use(registerRouter())
app.use(staticFiles(path.join(__dirname + './public/')))

app.listen(3000,()=>{
    console.log('[travel] server is starting at port 3000');
});