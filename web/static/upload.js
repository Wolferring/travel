class Upload{
  constructor(el,options = {}){
    this.$el = document.querySelector(el)
    this.fileList = [] 
    this.options = options
    this._init()
  }
  _init(){
    let self = this
    self.$el.classList.add("upload")
    self.$el.appendChild(util.createDom(`
          <div class="upload-preview">
            <div class="upload-card">
              <input class="form-control upload-control" multiple type="file"  accept="image/*" ">
            </div>
          </div> 
      `))
    self.$preview = self.$el.querySelector(".upload-preview")
    self.$card = self.$preview.querySelector(".upload-card")
    self.$input = self.$el.querySelector(".upload-control")
    self.$input.addEventListener("change",(ev)=>{
      self.fileChange(ev.srcElement)
    })
    self.$card.addEventListener("click",()=>{
      self.$input.click()
    })
    self.$preview.addEventListener("click",(e)=>{
      if(e.srcElement.classList.contains('upload-preview-image-remove')){
        let index = Array.from(self.$preview.querySelectorAll('.upload-preview-image')).indexOf(e.srcElement.parentNode)
        self.fileList.splice(index,1)
        e.srcElement.parentNode.remove()
      }
    })
    if(self.options.drag){
      self.$el.addEventListener('dragleave', function(e) {
          self.$el.classList.remove("dragging")
      });              
      self.$el.addEventListener('dragover', function(e) {
          e.stopPropagation();
          //阻止浏览器默认打开文件的操作
          e.preventDefault();
          self.$el.classList.add("dragging")
          e.dataTransfer.dropEffect = 'copy';
      });      
      self.$el.addEventListener("drop", function(e) {
          e.stopPropagation();
          //阻止浏览器默认打开文件的操作
          e.preventDefault();
          self.$el.classList.remove("dragging")
          var files = e.dataTransfer.files
          self.filePreview(files)
      });      
    }
  }
  filePreviewReset(){
    let self = this
    self.fileList = []
    self.$preview.querySelectorAll('.upload-preview-image')
    .forEach(item=>{
      item.remove()
    })            
  }
  filePreview(files){
    let self = this
    let node  = self.$card,
      html  = ``
    for(let file of files){
      self.fileList.push(file)
      html = `<div class="upload-preview-image">
              <div class="upload-preview-image-remove">
                 X
              </div>
              <img src="${window.URL.createObjectURL(file)}" alt="">
              </div>`
      let newImage = util.createDom(html)
      self.$preview.insertBefore(newImage,node)
    }
  }
  fileChange(img){
    let images = img.files,
        self = this;
    if(images.length){
      self.filePreview(images)
    }
  } 
  upload(){
    let self = this
    return new Promise((resolve,reject)=>{
      if(self.fileList.length<1){
        resolve([])
        return false
      }
      let formData = new FormData()
      self.fileList.forEach(file=>{
        formData.append('files',file)
      })
      api.upload(formData)
      .then(res=>{
        resolve(res.data)
      })
    })
  }  
}