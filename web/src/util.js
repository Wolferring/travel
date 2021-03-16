const util = (()=>{
  const realType = (val)=>{
    return Object.prototype.toString.call(val)
  }
  // HTMLElement.prototype.loading = (state)=>{
  //   alert("loading")
  // }
  Date.prototype.format = function(fmt){   
    var o = {   
      "M+" : this.getMonth()+1,                 //月份   
      "d+" : this.getDate(),                    //日   
      "h+" : this.getHours(),                   //小时   
      "m+" : this.getMinutes(),                 //分   
      "s+" : this.getSeconds(),                 //秒   
      "q+" : Math.floor((this.getMonth()+3)/3), //季度   
      "S"  : this.getMilliseconds()             //毫秒   
    };   
    if(/(y+)/.test(fmt))   
      fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
    for(var k in o)   
      if(new RegExp("("+ k +")").test(fmt))   
    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
    return fmt;   
  }    
  let toastList = []
  return {
    realType:(val)=>{
      return Object.prototype.toString.call(val)
    },
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
    isNaN:(val)=>{
      return Number.isNaN(val)
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
    valid:(selector)=>{
      let valid = true
      let inputs = document.querySelector(selector).querySelectorAll(".form-control[name]")
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
    toast:(content,options={duration:3000})=>{
      let t = {
        el:util.createDom(`<div class="toast-item">${content}</div>`),
        height:0,
        bottom:0
      }
      let top = 10
      if(options.type){
        t.el.classList.add({"error":"toast-danger","success":"toast-primary"}[options.type])
      }
      if(toastList.length){
        top = document.querySelector(".toast-item:last-of-type").getBoundingClientRect().bottom+10
      }
      t.el.style.top = top+"px"
      toastList.push(t)
      document.body.appendChild(t.el)
      t.height = t.el.offsetHeight    
      setTimeout(()=>{
        t.el.classList.add('fade-out')
        setTimeout(()=>{
          t.el.remove()
        },200)
        toastList.splice(0,1)
        toastList.forEach(item=>{
          item.el.style.top = (parseInt(item.el.style.top,10) - t.height - 10)+"px"
        })   
      },3000)


    },
    confirm:(content,options={fitEl:false})=>{
      let node = util.createDom(`<div class="confirm-container"> <div class="confirm-content">  <p class="confirm-text">${content}</p><div class="confirm-control"><button class="button button-confirm">确认</button><button class="button button-default button-cancel">取消</button></div></div></div></div>`)
      if(options.type){
        node.classList.add({"error":"toast-danger","success":"toast-primary"}[options.type])
      }
      let pr = new Promise((resolve,reject)=>{
        node.querySelector(".button-cancel").addEventListener("click",()=>{
          node.classList.remove("show")
          setTimeout(()=>{
            node.remove()
          },200)
          resolve(false)
        })
        node.querySelector(".button-confirm").addEventListener("click",()=>{
          node.classList.remove("show")
          setTimeout(()=>{
            node.remove()
          },200)          
          resolve(true)
        })      
      })
      if(options.fitEl){
        let content = node.querySelector(".confirm-content")
        content.style.position = "absolute"
        let bouding = options.fitEl.getBoundingClientRect()

        if(document.body.clientWidth - bouding.right -5 > 200){
          content.style.left = (bouding.right+5)+"px"
        }else if(bouding.left -5 > 200){
          content.style.left = (bouding.left - 200 - 5)+"px"
        }
        content.style.top = (bouding.top)+"px"
      }
      document.body.appendChild(node)
      setTimeout(()=>{
        node.classList.add("show")
      },0)      

      return pr
    },    
    clearTimeout:(tm)=>{
      tm.forEach(item=>{
        clearTimeout(item)
      })
    }
  }
})()

export default util