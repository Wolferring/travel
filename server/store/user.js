const mysql = require('./mysql.js')
let cols = "id,username,nickname,avatar,create_time,update_time"
let findUserByName = function(username) {
  let _sql = `select ${cols} from user where username = '${username}';`
  return mysql.query( _sql )
}
let findRawUserByName = function(username){
  let _sql = `select * from user where username = '${username}';`
  return mysql.query( _sql )
}
let findUserById = function(id) {
  let _sql = `select ${cols} from user where id = ${id};`
  return mysql.query( _sql )
}
let insertUser = function(user) {
  let _sql = `insert into user 
  set username=?,
  password=?,
  nickname=?,
  avatar=?;`
  return mysql.query( _sql, user )
}
module.exports = {
  findUserById,
  findRawUserByName,
  findUserByName,
  insertUser
}