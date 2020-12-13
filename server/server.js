const Koa = require('koa');
const app = new Koa();
const registerRouter = require('./router/index.js')
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser')
const koajwt = require('koa-jwt')
const config = require('./store/config.js')
const AUTH = require('./util/token.js')
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
app.use(bodyParser())
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
  path: [/^\/login/,/^\/register/]
}));
app.use(registerRouter())

app.listen(3000,()=>{
    console.log('[travel] server is starting at port 3000');
});