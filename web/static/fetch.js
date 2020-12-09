var AUTH = window.localStorage.getItem("AUTH")

var ajax = (opt)=>{
  let options = Object.assign({
    url:"/",
    headers:{},
    method:"GET",
    data:""
  },opt)

  options.headers['Authorization'] = AUTH

  return fetch("//localhost:3000"+options.url,options)
  .then(response => response.json())
}