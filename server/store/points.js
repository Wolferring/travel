const mysql = require('./mysql.js')


let points =
    `create table if not exists points(
     id INT NOT NULL AUTO_INCREMENT,
     title VARCHAR(400) NOT NULL,
     province VARCHAR(40),
     city VARCHAR(400HAR(40),
     address VARCHAR(400) NOT NULL,
     remark VARCHAR(2000) NOT NULL,
     lnglat CHAR(50) NOT NULL,
     dateTime date NOT NULL,
     status ENUM('ACTIVE','DELETE') DEFAULT 'ACTIVE',
     PRIMARY KEY ( id )
    );`

mysql.createTable(points)

let findPoints = function( ) {
  let _sql = `select * from points where status = 'ACTIVE';`
  return mysql.query( _sql )
}
let findPointsByGroup = function( ) {
  let _sql = `SELECT province FROM points WHERE status = 'ACTIVE' GROUP BY province`
  return mysql.query( _sql )
}
let findPointsById = function(value) {
  let _sql = `select * from points where id = ${value} and status = 'ACTIVE';`
  return mysql.query( _sql )
}
let removePointsById = function(value) {
  let _sql = `UPDATE points SET status = 'DELETE' where id = ${value};`
  return mysql.query( _sql )
}
let insertPoint = function( value ) {
  let _sql = `insert into points 
  set title=?,
  address=?,
  remark=?,
  lnglat=?,
  dateTime=?,
  province=?,
  city=?;`
  return mysql.query( _sql, value )
}


module.exports = {
    findPoints,
    findPointsById,
    removePointsById,
    findPointsByGroup,
    insertPoint
}