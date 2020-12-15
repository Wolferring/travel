const mysql = require('./mysql.js')
let insertImages = function(value) {
  let _sql = `insert into images(url,uid) values ?;`
  return mysql.query( _sql, [value] )
}
let updateImagesPOI = function(pid,uid,ids) {
  let _sql = `update images set pid= ? where uid=? and id in ?;`
  return mysql.query( _sql, [pid,uid,[ids]] )
}
module.exports = {
  insertImages,
  updateImagesPOI
}