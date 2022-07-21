const mysql = require('./mysql.js')
let cols = "id,openId,phone,username,nickname,avatar,create_time,update_time"

let findUserByPhone = function(phone) {
  let _sql = `select ${cols} from user where phone = '${phone}';`
  return mysql.query( _sql )
}
let findUserByOpenId = function(openId) {
  let _sql = `select * from user where openId = '${openId}';`
  return mysql.query( _sql )
}
let findRawUserByPhone = function(username){
  let _sql = `select * from user where username = '${username}' or phone = '${username}';`
  return mysql.query( _sql )
}
let findUserById = function(id) {
  let _sql = `select ${cols} from user where id = ${id};`
  return mysql.query( _sql )
}
let findSMSByPhone = function(phone) {
  let _sql = `select * from sms where phone = ${phone} order by id desc limit 1;`
  return mysql.query( _sql )
}
let insertUser = function(user) {
  let _sql = `insert into user 
  set phone=?,
  password=?,
  nickname=?,
  avatar=?;`
  return mysql.query( _sql, user )
}
let insertSMS = function(sms) {
  let _sql = `insert into sms 
  set code=?,
  phone=?,
  type=?,
  bizId=?;`
  return mysql.query( _sql, sms )
}
let bindOpenId = function(id,openId){
  let _sql = `update user set openId = '${openId}' where id=${id};`
  console.log(_sql)
  return mysql.query( _sql)
}
let updateUser = function(id,query){
  let query_string = [],
      values = []
  for(let item in query){
    if(["password","phone"].indexOf(item)>-1) continue
    query_string.push(`${item} = ? `)
    values.push(query[item])
  }
  let _sql = `update user set ${query_string.join(",")} where id=${id};`
  console.log(_sql)
  return mysql.query( _sql, values )
}
let updateUserPassword = function(id,pass){

}
module.exports = {
  findUserById,
  findUserByOpenId,
  updateUserPassword,
  findSMSByPhone,
  findRawUserByPhone,
  findUserByPhone,
  updateUser,
  bindOpenId,
  insertUser,
  insertSMS
}