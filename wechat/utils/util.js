const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}
const openLogin = ()=>{
  let current = getCurrentPages()
  console.log(current)
  var hasLoginOpen = current.some(function (currentValue) {
    return currentValue.route == 'pages/login/login';
  })
  if(!hasLoginOpen){
    wx.navigateTo({
      url: '/pages/login/login',
    })
  }

}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

module.exports = {
  formatTime,
  openLogin
}
