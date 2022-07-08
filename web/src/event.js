class EventBus{
  constructor(){
    this.eventsList = {}
  }
  _pushEvent(name,fn){
    let self = this
    if(Object.prototype.hasOwnProperty.call(self.eventsList,name)){
      self.eventsList[name].push(fn)
    }else{
      self.eventsList[name] = [fn]
    }    
  }
  on(eventName,fn){
    let self = this
    let type = Object.prototype.toString.call(eventName)
    if(type=="[object String]"){
      self._pushEvent(eventName,fn)
      return self
    }
    if(type=="[object Array]"){
      eventName.forEach(ev=>{
        self._pushEvent(ev,fn)
      })
      return self
    }
    return false
  }
  emit(eventName,e){
    let self = this
    let ev = [].shift.call(arguments),
        fns = [...self.eventsList[ev]];
    if(!fns||fns.length==0) return false
    fns.forEach(fn=>{
      fn.apply(self,arguments)
    })
  }
}
const GLOBAL_EVENT = new EventBus()
export {EventBus,GLOBAL_EVENT}