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
let updateUser = function(id,query){
  let query_string = [],
      values = []
  for(let item in query){
    if(item=="password") continue
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
  updateUserPassword,
  findRawUserByName,
  findUserByName,
  updateUser,
  insertUser
}