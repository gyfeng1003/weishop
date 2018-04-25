const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const uninqueArr = (arr)=>{
  var obj={},
  result=[],
  len = arr.length;
  for(var i=0; i<len; i++){
    if(!obj[arr[i]]){
      obj[arr[i]] = 1;
      result.push(arr[i])
    }
  }
  return result
}

const uniqueArrObj = (arr)=>{
  var hash = {};
  arr = arr.reduce(function (item, next) {
    hash[next.name] ? '' : hash[next.name] = true && item.push(next);
    return item
  }, [])
  return arr
}

module.exports = {
  formatTime: formatTime,
  uninqueArr,
  uniqueArrObj
}
