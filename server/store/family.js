const mysql = require('./mysql.js')
let findFamilyByUser = async (uid)=>{
//   let _sql = `SELECT * from family_relation where u_id = ${uid} and status='ACTIVE' order by id desc;`

  let _sql = `
  WITH t as (select 
	family.nickname,
	family.id,
	count(family_relation.id) AS 'joined',
	user.id as 'owner_id',
	user.nickname as 'owner'
	from family 
    INNER JOIN user 
	ON user.id = family.owner 
	INNER JOIN family_relation 
	on family.id=family_relation.family_id
	AND family_relation.u_id=${uid}
	GROUP BY family.id),
    r as (
        SELECT  
        JSON_ARRAYAGG(
            JSON_OBJECT(
                "id",user.id,
                "nickname",user.nickname
            )
        )  as users,         
        family_id as id 
        from family_relation 
        INNER JOIN user ON user.id = family_relation.u_id
        WHERE  family_id in (select id from t)
        GROUP BY family_id  )
    SELECT t.*,r.users from t INNER JOIN r on t.id=r.id;
  `  
  let result = await mysql.query( _sql)
  if(!result) return []
  if(Object.prototype.toString.call(result)==="[object Array]"){
    return result
  }else{
    return [result]
  }  
}

let findOwnedFamilyByUser = async (uid,$where="")=>{
    //   let _sql = `SELECT * from family_relation where u_id = ${uid} and status='ACTIVE' order by id desc;`
    
      let _sql = `
      SELECT * from family WHERE owner=${uid} ${$where}
      `  
      let result = await mysql.query( _sql)
      if(!result) return []
      if(Object.prototype.toString.call(result)==="[object Array]"){
        return result
      }else{
        return [result]
      }  
}
let findFamilyById = async (id,uid)=>{
    //   let _sql = `SELECT * from family_relation where u_id = ${uid} and status='ACTIVE' order by id desc;`
    
      let _sql = `
      WITH f as (SELECT 
      family.*,
      user.nickname AS owner_name,
      count(family_relation.id) AS joined
      from family 
      INNER JOIN user on user.id=family.owner 
      LEFT JOIN family_relation 
			on family.id=family_relation.family_id  
			and family_relation.u_id=${uid}
			and family_relation.status!='DELETE'
        WHERE family.id=${id}),
      t as (SELECT  
        JSON_ARRAYAGG(
            JSON_OBJECT(
                "id",user.id,
                "nickname",user.nickname
            )
        )  as users,         
        family_id as id 
        from family_relation 
        INNER JOIN user ON user.id = family_relation.u_id
        WHERE family_id = ${id} )
        SELECT f.*,t.users from f INNER JOIN t on f.id=t.id;
      `  
      let result = await mysql.query( _sql)
      return result
}
let joinFamily = async (id,uid)=>{
    let _sql = `
    insert into family_relation 
    set family_id='${id}',
    u_id=${uid};`
    let result = await mysql.query( _sql ) 
    return result
  }
let insertFamily = async (nickname,uid)=>{
  let _sql = `
  insert into family 
  set nickname='${nickname}',
  owner=${uid};`
  let step1 = await mysql.query( _sql ) 
  if(step1.insertId){
    await joinFamily(step1.insertId,uid)
    return step1
  }
}
let removeCommentById = function(id,uid) {
  let _sql = `UPDATE comments SET status = 'DELETE' where id = ${id} and from_id = ${uid};`
  return mysql.query( _sql )
}
module.exports = {
    insertFamily,
    joinFamily,
    findFamilyByUser,
    findFamilyById,
    findOwnedFamilyByUser
}