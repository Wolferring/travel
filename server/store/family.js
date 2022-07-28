const mysql = require('./mysql.js')
let findFamilyByUser = async (uid)=>{
//   let _sql = `SELECT * from family_relation where u_id = ${uid} and status='ACTIVE' order by id desc;`

  let _sql = `
  WITH t as (select 
	family.nickname,
    family.create_time,
	family.id,
	family.status,
	family_relation.status AS 'joined',
	user.id as 'owner_id',
	user.nickname as 'owner'
	from family 
    INNER JOIN user 
	ON user.id = family.owner 
	INNER JOIN family_relation 
	on family.id=family_relation.family_id
	AND family_relation.u_id=${uid}
    AND family_relation.status != 'DELETE'
    WHERE family.status = 'ACTIVE'),
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
        WHERE  family_id in (select id from t)  AND status='ACTIVE'
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
      family_relation.status AS joined
      from family 
      INNER JOIN user on user.id=family.owner 
      LEFT JOIN family_relation 
			on family.id=family_relation.family_id  
			and family_relation.u_id=${uid}
			and family_relation.status!='DELETE'
        WHERE family.id=${id} AND family.status = 'ACTIVE' ),
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
        WHERE family_id = ${id} AND status='ACTIVE')
        SELECT f.*,t.users from f INNER JOIN t on f.id=t.id;
      `  
      let result = await mysql.query( _sql)
      return result
}
let joinFamily = async (id,uid)=>{
    let _sql = ``
    let hasRelation = await mysql.query(`
        SELECT * from family_relation WHERE family_id=${id} AND u_id=${uid}
    `)
    if(hasRelation&&hasRelation.id){
        _sql = `
        UPDATE family_relation SET 
        status = 'PENDING' 
        where family_id = ${id} and u_id = ${uid};        
        `
    }else{
        _sql = `
        insert into family_relation 
        set family_id='${id}',
        u_id=${uid},
        status='PENDING';`
    }

    let result = await mysql.query( _sql ) 
    return result
}
let leaveFamily = async (id,uid)=>{
    let _sql = `
    UPDATE family_relation SET 
    status = 'LEAVE' 
    where family_id = ${id} and u_id = ${uid};`
    let result = await mysql.query( _sql ) 
    return result
}
let isFamilyJoined = async (id,uid)=>{
    let _sql = `
    SELECT * from family_relation 
    where u_id=${uid} 
    AND family_id=${id}
    AND status='ACTIVE'`
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
let findPendingRequestByUser = async (uid)=>{
      let _sql = `
      SELECT family.nickname,family.id,user.nickname as unickname,user.id as uid,family_relation.status as joined from family_relation 
        INNER JOIN family
        ON family.id = family_relation.family_id 
        AND family.owner = ${uid}
        LEFT JOIN user on user.id = family_relation.u_id
        WHERE family_relation.status = 'PENDING'
      `  
      let result = await mysql.query( _sql)
      if(!result) return []
      if(Object.prototype.toString.call(result)==="[object Array]"){
        return result
      }else{
        return [result]
      }  
}
let removeCommentById = function(id,uid) {
  let _sql = `UPDATE comments SET status = 'DELETE' where id = ${id} and from_id = ${uid};`
  return mysql.query( _sql )
}
module.exports = {
    isFamilyJoined,
    insertFamily,
    joinFamily,
    leaveFamily,
    findFamilyByUser,
    findFamilyById,
    findOwnedFamilyByUser,
    findPendingRequestByUser
}