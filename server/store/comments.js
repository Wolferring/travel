const mysql = require('./mysql.js')
let findCommentsByPid = async (pid)=>{
  let _sql = `SELECT * from comments where pid = ${pid} and status='ACTIVE' order by id desc;`
  let result = await mysql.query( _sql)
  if(!result) return []
  if(Object.prototype.toString.call(result)==="[object Array]"){
    return result
  }else{
    return [result]
  }  
}
let findCommentById = async (id)=>{
  let _sql = `SELECT * from comments where id = ${id} ;`
  let result = await mysql.query( _sql)
  if(!result) return []
  if(Object.prototype.toString.call(result)==="[object Array]"){
    return result
  }else{
    return [result]
  }  
}
let insertComment = async (value)=>{
  let _sql = `insert into comments 
  set content=?,
  from_id=?,
  to_id=?,
  pid=?,
  nickname=?,
  avatar=?;`
  return mysql.query( _sql, value ) 
}
let removeCommentById = function(id,uid) {
  let _sql = `UPDATE comments SET status = 'DELETE' where id = ${id} and from_id = ${uid};`
  return mysql.query( _sql )
}
module.exports = {
  insertComment,
  findCommentById,
  removeCommentById,
  findCommentsByPid
}