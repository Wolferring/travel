const mysql = require('./mysql.js')
let findCommentsByPid = async (pid)=>{
  console.log(pid)
  let _sql = `SELECT * from comments where pid = ${pid} order by id desc;`
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

module.exports = {
  insertComment,
  findCommentsByPid
}