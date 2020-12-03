// 求普通数组交集
export function getIntersection(arr1, arr2) {
  let result = arr1.filter(function(val) { return arr2.indexOf(val) > -1 })
  return result
}
//数组去重(普通数组)
export function dislodgeRepeat(arr) {
  let result = [...new Set(arr)]
  return result
}
//数组去重(对象数组)
export function dislodgeObjRepeat(arr) {
  let result = []
  arr.forEach(item => {
  	if (!result.some(v => JSON.stringify(v) === JSON.stringify(item))) {
  		result.push(item)
  	}
  	// !result.some(v => JSON.stringify(v) === JSON.stringify(item)) && result.push(item)
  })
  return result
}
// 数字千分位
export function thousandNum(num = 0) {
  const str = (+num).toString().split(".")
  const int = nums => nums.split("").reverse().reduceRight((t, v, i) => t + (i % 3 ? v : `${v},`), "").replace(/^,|,$/g, "")
  const dec = nums => nums.split("").reduce((t, v, i) => t + ((i + 1) % 3 ? v : `${v},`), "").replace(/^,|,$/g, "")
  return str.length > 1 ? `${int(str[0])}.${dec(str[1])}` : int(str[0])
}
// 给日期加上两个"-"号,比如20200520变成2020-05-20
export function composeNewStr(str) {
  const things = [
    { thing: "-", sp: 4 },
    { thing: "-", sp: 6 }
  ]
  const strArr = str.split("");
  things.forEach(item => {
    const { sp: index, thing = "" } = item; //thing = ''代表是给thing一个默认值，为空
    strArr[index] = thing + (strArr[index] || "");
  });
  return strArr.join("");
}
// 小数点的保留,多余两位留2位，少于2位是多少就多少
export function decimalConversion(value) {
  let parseFloat = Math.round(parseFloat(value) * 100) / 100
  return parseFloat
}
// 把毫秒数转换为年-月-日
function calculateDates(result) {
  let Y = result.getFullYear()
  let M = result.getMonth() + 1 < 10 ? '0' + (result.getMonth() + 1) : result.getMonth() + 1
  let D = result.getDate() < 10 ? '0' + result.getDate() : result.getDate()
  let srtDate = Y + '/' + M + '/' + D
  return srtDate
}
//为el-date-picker设置默认时间为昨天
export function standardDateFormat() {
  let times = new Date()
  let yestodayTime = times.setTime(times.getTime() - 3600*1000*24)
  return calculateDates(new Date(yestodayTime))
}

//为el-date-picker设置默认时间（7天)
export function setDefaultTime() {
  let time = new Date()
  let endTimeStamp = time.setTime(time.getTime() - 3600*1000*24)
  let startTimeStamp = time.setTime(time.getTime() - 3600*1000*24*7)
  let startResult = calculateDates(new Date(startTimeStamp))
  let endResult = calculateDates(new Date(endTimeStamp))
  let resultArr = [startResult, endResult]
  return resultArr
}
// 名字除了姓都隐藏
export function hiddenName(strName) {
	let reg = /(?<=.)./g;
	return strName.replace(reg, '*');
}

// 隐藏电话号码中间4位
export function hiddenPhone(tel) {
	return tel.substring(0, 3)+"****"+tel.substr(7);
}