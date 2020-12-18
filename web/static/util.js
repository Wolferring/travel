window.util = (()=>{
  const realType = (val)=>{
    return Object.prototype.toString.call(val)
  }
  let toastList = []
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
      let replace = url.replace(/(.*\/)*([^.]+).*/ig,"$2")
      return url.replace(replace,replace+str)
    },
    isNull:(val)=>{
      return realType(val)==="[object Null]"
    },
    isString:(val)=>{
      return realType(val)==="[object String]"
    },
    isArray:(val)=>{
      return realType(val)==="[object Array]"
    },
    valid:(el)=>{
      let valid = true
      let inputs = document.querySelector(el).querySelectorAll(".form-control[name]")
      inputs.forEach(input=>{
        input.classList.remove("invalid")
        let value = input.value
        if(util.isString(value)){
          value = value.trim()
        }
        if(input.getAttribute("required")=="required"){
          if(value===""||value===null||value===undefined){
            input.classList.add("invalid")
            valid = false 
          }
        }
        if(input.getAttribute("data-pattern")){
          if(!new RegExp(input.getAttribute("data-pattern")).test(value)){
            input.classList.add("invalid")
            valid = false
          }
        }
      })
      return valid
    },    
    toast:(content,options={})=>{
      let node = util.createDom(`<div class="toast-item">${content}</div>`)
      let top = 10
      if(options.type){
        node.classList.add({"error":"toast-danger","success":"toast-primary"}[options.type])
      }
      toastList.forEach(item=>{
        top += item.offsetHeight+10
      })
      node.style.top = top+"px"
      let index = toastList.length-1
      setTimeout(()=>{
        toastList.splice(index,1)
        node.remove()
      },5000)
      toastList.push(node)
      document.body.appendChild(node)
    }
  }
})()