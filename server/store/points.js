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

let findPoints = async (uid)=>{
  let _sql = `SELECT p.* , GROUP_CONCAT("{'url':'",img.url,"',","'id':",img.id,",'thumb':'",img.thumb,"'}") as images  from points as p left join images as img on img.pid = p.id where p.uid = ${uid} AND p.status = "ACTIVE"  group by p.id;`
  let result = await mysql.query( _sql )
  if(!result) return []
  if(Object.prototype.toString.call(result)==="[object Array]"){
    return result
  }else{
    return [result]
  }
}
let findPointById = function(value,uid) {
  let _sql = `SELECT p.* , GROUP_CONCAT("{'url':'",img.url,"',","'id':",img.id,",'thumb':'",img.thumb,"'}") as images  from points as p left join images as img on img.pid = p.id where p.id=${value} AND p.uid = ${uid} AND p.status = "ACTIVE"  group by p.id;`
  return mysql.query( _sql )
}
let findPointsByTime = function(uid) {
  let _sql = `SELECT p.* , GROUP_CONCAT("{'url':'",img.url,"',","'id':",img.id,",'thumb':'",img.thumb,"'}") as images  from points as p left join images as img on img.pid = p.id where p.uid = ${uid} AND p.status = "ACTIVE"  group by p.id ORDER BY p.dateTime DESC limit 4;`
  return mysql.query( _sql )
}

let findPointsByGroup = function(uid) {
  let _sql = `SELECT province FROM points WHERE status = 'ACTIVE' and uid = ${uid} GROUP BY province`
  return mysql.query( _sql )
}
let findPointsGroupByCity = async function(uid) {
  let pois = await mysql.query(`SELECT p.city,COUNT(p.id) AS total,GROUP_CONCAT(id) as ids FROM points as p WHERE uid=${uid} and status="ACTIVE" GROUP BY p.city limit 4;`)
  // let _sql = `SELECT * FROM points WHERE status = 'ACTIVE' and uid = ${uid} GROUP BY city`
  if(pois.length){
    for(item of pois){
      let img = await mysql.query(`SELECT url,thumb from images where pid in (${item.ids})`)
      item["images"] = img      
    }
  }
  return pois
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
    findPointsGroupByCity,
    findPointsByTime,
    findPointsByGroup,
    insertPoint
}