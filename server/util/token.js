const jwt = require("jsonwebtoken")
const config = require('../store/config.js')
const user = require('../store/user.js')
exports.set = (user)=>{
 return new Promise((resolve,reject)=>{
  const token = jwt.sign({
    phone:user.phone,
    avatar:user.avatar,
    nickname:user.nickname,
    username:user.username,
    id:user.id
  },config.secret,{ expiresIn: "7d" })
  resolve(token)
 })
 .catch(e=>{
  console.log("set token fail:"+e)
 })
}

exports.verify = (token)=>{
 return new Promise((resolve,reject)=>{
  var user = jwt.verify(token.split(" ")[1],config.secret)
  if(parseInt(new Date().getTime()/1000) - user.exp>=0){
    reject("token expire")
  }else{
    resolve(user)
  }
  // if(user.username!=1){
  // }else{
  // }
 })
}