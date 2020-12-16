window.util = {
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
  }
}