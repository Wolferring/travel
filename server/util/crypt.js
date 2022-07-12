const bcrypt = require("bcrypt")
exports.encrypt = (code)=>{
  let salt = bcrypt.genSaltSync(5)
  let hash = bcrypt.hashSync(code,salt)
  return hash
}
exports.decrypt = (password,hash)=>{
  return bcrypt.compareSync(password,hash)
}
