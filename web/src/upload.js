import util from './util.js'
import api from './fetch.js'
class Upload{
  constructor(el,options = {
    maxSize:50*1024,
    multiple:true
  }){
    this.$el = document.querySelector(el)
    this.fileList = []
    this.options = options
    this.uploading = false
    this._init()
  }
  _init(){
    let self = this
    self.$el.classList.add("upload")
    self.$el.appendChild(util.createDom(`
          <div class="upload-preview">
            <div class="upload-card">
              <input class="form-control upload-control" ${self.options.multiple?"multiple":""} type="file"  accept="image/*" ">
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
      self.previewRemove(e)
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
  previewRemove(e){
    let self = this
    if(e&&e.srcElement.classList.contains('upload-preview-image-remove')){
      let index = Array.from(self.$preview.querySelectorAll('.upload-preview-image')).indexOf(e.srcElement.parentNode)
      self.fileList.splice(index,1)
      e.srcElement.parentNode.remove()
    }
    if(!self.options.multiple&&self.fileList.length==0){
      self.$card.style.display = "block"
    }    
  }
  filePreviewReset(){
    let self = this
    self.fileList = []
    self.$el.value = null
    self.$preview.querySelectorAll('.upload-preview-image')
    .forEach(item=>{
      item.remove()
    })            
  }
  singleFilePreview(files){
    let file = files[0],
        self = this;
    if(file.size/1024>self.options.maxSize){
      util.toast(`【${file.name}】文件过大，单个文件小于${self.options.maxSize/1024}M`,{
        type:"error"
      })        
      return false;
    }
    self.fileList = [file]
    let container = util.createDom(`<div class="upload-single-container">
    <div class="upload-single-preview">
      <div class="upload-single-image">
        <img src="${window.URL.createObjectURL(file)}" alt="">
      </div>
      <div class="upload-single-control">
        <button class="button button-default upload-single-cancel">取消</button>
        <button class="button upload-single-upload">确认上传</button>
      </div>
    </div>
    </div>`)
    document.body.appendChild(container)
    container.querySelector(".upload-single-cancel").addEventListener("click",()=>{
      container.remove()
    })
    container.querySelector(".upload-single-upload").addEventListener("click",()=>{
      self.upload()
      .then(res=>{
        container.remove()
        if(util.realType(self.options.success)=="[object Function]"){

          self.options.success(res[0])
        }

      })
    })    
  }
  filePreview(files){
    let self = this
    let node  = self.$card,
      html  = ``
    for(let file of files){
      if(file.size/1024>self.options.maxSize){
        util.toast(`【${file.name}】文件过大，单个文件小于50M`,{
          type:"error"
        })        
        continue;
      }
      if(!self.options.multiple){
        self.fileList = []
        self.$card.style.display = "none"
      }
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
    if(images.length&&self.options.multiple){
      self.filePreview(images)
    }
    if(images.length&&!self.options.multiple){
      self.singleFilePreview(images)
    }    
  } 
  upload(){
    let self = this,
        totalSize = 0;
    self.uploading = true
    self.fileList.forEach(file=>{
      totalSize+=file.size
    })   
    //总文件大小超过最大允许大小后，需要对文件进行分批上传
    if(totalSize/1024>self.options.maxSize){
      return new Promise((finalResolve,finalReject)=>{
        util.toast("文件总大小超过50M，正在分批上传，请等待",{
          type:"success"
        })
        self.fileList.sort((a,b)=>{
          return a.size-b.size
        })
        //将文件列表按照大小排序
        let subTotal = 0,
            index = 0,
            requests = [];
        for(let file of self.fileList){
          //这里不需要判断单个文件大小，preview的时候判断过了
          if((subTotal+file.size)/1024<self.options.maxSize){
            //当前文件加之前的文件大小 小于max，把该文件推入本次请求
            subTotal+=file.size
            if(requests[index]){
              requests[index].push(file)
            }else{
              requests[index] = [file]
            }
          }else{
            //如果当前文件+之前的文件大小大于max，开启新的请求
            ++index
            subTotal = file.size
            requests[index] = [file]
          }
        }
        let data = [],
            promises = [];
        //准备多个Promise，需要等多个请求都完成后，才resolve全部
        for(let request of requests){
          promises.push(new Promise((resolve,reject)=>{
            let formData = new FormData()
            request.forEach(file=>{
              formData.append('files',file)
            })        
            api.upload(formData)
            .then(res=>{
              data = data.concat(res.data)
              //拼接返回的数据
              resolve()
            })           
          })
          )
        }
        Promise.all(promises)
        .then(res=>{
          finalResolve(data)
        })
        .catch(e=>{
          finalReject(e)
        })
        .finally(e=>{
          self.uploading = false
        })
        //所有请求完成后，resolve整体
      })      
      //这里有个算法组合的问题，已知最单次请求最大不超过50M，文件大小[2,10,32,10,33,23]，如何组合才能实现最少请求次数
      // return Promise.reject()
    }else{
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
        .catch(e=>{
          if(e.msg){
            util.toast(msg,{
              type:"error"
            })
          }
        })
        .finally(e=>{
          self.uploading = false
        })
      })
    }
  }  
}
export default Upload