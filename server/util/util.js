const util = (()=>{
  return {
    realType:(val)=>{
      return Object.prototype.toString.call(val)
    },
    resolveImagePath:(path)=>{
      return "//cdn.whimsylove.cn"+path
    }
  }
})()
module.exports = util