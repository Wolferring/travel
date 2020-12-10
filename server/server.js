const Koa = require('koa');
const app = new Koa();
const registerRouter = require('./router/index.js')
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser')

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
app.use(registerRouter())

app.listen(3000,()=>{
    console.log('[travel] server is starting at port 3000');
});