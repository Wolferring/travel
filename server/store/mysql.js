const config = require("./config.js")
const mysql = require('mysql')

var pool  = mysql.createPool({
  host     : config.database.HOST,
  user     : config.database.USERNAME,
  password : config.database.PASSWORD,
  database : config.database.DATABASE
})
let query = (sql,values)=>{

  return new Promise(( resolve, reject ) => {
    pool.getConnection((err, connection)=>{
      if (err) {
        reject( err )
      } else {
        connection.query(sql, values, ( err, rows) => {

          if ( err ) {
            reject( err )
          } else {
            resolve( rows )
          }
          connection.release()
        })
      }
    })
  })

}

let points =
    `create table if not exists points(
     id INT NOT NULL AUTO_INCREMENT,
     title VARCHAR(400) NOT NULL,
     address VARCHAR(400) NOT NULL,
     remark VARCHAR(2000) NOT NULL,
     lnglat CHAR(50) NOT NULL,
     dateTime date NOT NULL,
     PRIMARY KEY ( id )
    );`
let createTable = function( sql ) {
  return query( sql, [] )
}
createTable(points)

let findPoints = function( ) {
  let _sql = `select * from points;`
  return query( _sql )
}
let findPointsById = function(value) {
  let _sql = `select * from points where id = ${value};`
  return query( _sql )
}
let insertPoint = function( value ) {
  let _sql = `insert into points 
  set title=?,
  address=?,
  remark=?,
  lnglat=?,
  dateTime=?;`
  return query( _sql, value )
}


module.exports = {
    query,
    createTable,
    findPoints,
    findPointsById,
    insertPoint
}