const mysql = require('./mysql.js')


let points =
    `create table if not exists points(
     id INT NOT NULL AUTO_INCREMENT,
     title VARCHAR(400) NOT NULL,
     province VARCHAR(40),
     city VARCHAR(40),
     address VARCHAR(400) NOT NULL,
     remark VARCHAR(2000) NOT NULL,
     lnglat CHAR(50) NOT NULL,
     dateTime date NOT NULL,
     status ENUM('ACTIVE','DELETE') DEFAULT 'ACTIVE',
     PRIMARY KEY ( id )
    );`

mysql.createTable(points)

let findPoints = function(uid) {
  let _sql = `select * from points where status = 'ACTIVE' and uid = ${uid};`
  return mysql.query( _sql )
}
let findPointsByGroup = function(uid) {
  let _sql = `SELECT province FROM points WHERE status = 'ACTIVE' and uid = ${uid} GROUP BY province`
  return mysql.query( _sql )
}
let findPointById = function(value,uid) {
  let _sql = `select * from points where id = ${value} and  uid = ${uid} and status = 'ACTIVE';`
  return mysql.query( _sql )
}
let removePointsById = function(value,uid) {
  let _sql = `UPDATE points SET status = 'DELETE' where id = ${value} and uid = ${uid};`
  return mysql.query( _sql )
}
let insertPoint = function(value,uid) {
  let _sql = `insert into points 
  set title=?,
  address=?,
  remark=?,
  lnglat=?,
  dateTime=?,
  province=?,
  city=?,
  uid=?;`
  return mysql.query( _sql, value )
}


module.exports = {
    findPoints,
    findPointById,
    removePointsById,
    findPointsByGroup,
    insertPoint
}