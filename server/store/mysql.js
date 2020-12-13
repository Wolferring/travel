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
            if(rows.length==0){
              resolve(null)
            }else if(rows.length&&rows.length==1){
              resolve( rows[0] )
            }else{
              resolve(rows)
            }
          }
          connection.release()
        })
      }
    })
  })

}
let createTable = function( sql ) {
  return query( sql, [] )
}

module.exports = {
    query,
    createTable
}