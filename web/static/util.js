window.util = (()=>{
  const realType = (val)=>{
    return Object.prototype.toString.call(val)
  }
  return {
    createDom:(str)=>{
      let div = document.createElement("div")
      div.innerHTML  = str
      let children = div.childNodes
      if(children.length<=1){
        return children[0]||null
      }else{
        let f = document.createDocumentFragment();
        while(children.length){
          f.appendChild(children[0])
        }
        return f
      }
    },
    resolvePreview:(url,width=200,height=200)=>{
      let str = `_${width}x${height}`
      return url.split(".")[0]+str+"."+ url.split(".")[1]
    },
    isNull:(val)=>{
      return realType(val)==="[object Null]"
    },
    isString:(val)=>{
      return realType(val)==="[object String]"
    },
    isArray:(val)=>{
      return realType(val)==="[object Array]"
    }
  }
})()