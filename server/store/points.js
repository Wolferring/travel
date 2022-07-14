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
let findSharedPointById = function(value,d) {
  let _sql = `SELECT p.* , GROUP_CONCAT("{'url':'",img.url,"',","'id':",img.id,",'thumb':'",img.thumb,"'}") as images  from points as p left join images as img on img.pid = p.id where p.id=${value} AND p.status = "ACTIVE"  group by p.id;`
  return mysql.query( _sql )
}
let findPointByRandom = function(uid) {

  let _sql = `SELECT * from images where uid=${uid} order by rand() limit 1`;

  return mysql.query( _sql )
}
let findPointsByTime = function(uid,limit=4) {
  let _sql = `SELECT p.* , GROUP_CONCAT("{'url':'",img.url,"',","'id':",img.id,",'thumb':'",img.thumb,"'}") as images from points as p left join images as img on img.pid = p.id where p.uid = ${uid} AND p.status = "ACTIVE"  group by p.id ORDER BY p.dateTime DESC limit ${limit};`
  return mysql.query( _sql )
}

let findPointsByGroup = function(uid) {
  let _sql = `SELECT province FROM points WHERE status = 'ACTIVE' and uid = ${uid} GROUP BY province`
  return mysql.query( _sql )
}
let findPointsGroupByCity = async function(uid,limit=4) {
  let pois = await mysql.query(`SELECT p.city AS city,COUNT(p.id) AS total,GROUP_CONCAT(id) as ids FROM points as p WHERE uid=${uid} and status="ACTIVE" GROUP BY p.city limit ${limit};`)
  // let _sql = `SELECT * FROM points WHERE status = 'ACTIVE' and uid = ${uid} GROUP BY city`
  if(pois.length){
    for(item of pois){
      let img = await mysql.query(`SELECT url,thumb from images where pid in (${item.ids})`)
      item["images"] = img      
    }
  }
  return pois
}
let findPointsGroupByProvince = async function(uid,limit=4) {
  let pois = await mysql.query(`SELECT p.province AS city,COUNT(p.id) AS total,GROUP_CONCAT(id) as ids FROM points as p WHERE uid=${uid} and status="ACTIVE" GROUP BY p.province limit ${limit};`)
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
let updatePoint = function(value,pid,uid) {
  let _sql = `update points 
  set title=?,
  remark=?,
  dateTime=? 
  where id=${pid} and uid = ${uid};`
  return mysql.query( _sql, value )
}

module.exports = {
    findPoints,
    findPointById,
    findSharedPointById,
    removePointsById,
    findPointsGroupByCity,
    findPointsGroupByProvince,
    findPointsByTime,
    findPointByRandom,
    findPointsByGroup,
    insertPoint,
    updatePoint
}