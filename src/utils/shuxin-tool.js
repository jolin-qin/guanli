import moment from "moment";

/**
 * 通用js方法封装处理
 * Copyright (c) 2019 ruoyi
 */

const baseURL = process.env.VUE_APP_BASE_API

/**
 * 获取指定时间范围的所有时间列表
 * @param {Object} beginDate 时间格式："YYYY-MM-DD"
 * @param {Object} endDate 时间格式："YYYY-MM-DD"
 */
export function betweenDayList(beginDate, endDate) {

  console.log(`beginDate=${beginDate}  endDate=${endDate}`)
  // 获取入参字符串形式日期的Date型日期
  var st = moment(beginDate, "YYYY-MM-DD");
  var et = moment(endDate, "YYYY-MM-DD");
  //console.log(`st=${st}  et=${et}`)
  var dayArr = [];
  // 循环
  while (st.isBefore(et)) {
    dayArr.push(st.format("YYYYMMDD"));
    // 使用days进行天数的自增
    st = st.add(1, "days");
  }
  // 将结束日期的天放进数组
  dayArr.push(et.format("YYYYMMDD"));
  return dayArr;
}

/**
 * 时间格式化,采用moment实现
 * 文档:http://momentjs.cn/docs/#/query/is-before/
 * @param {Object} dateObj new Date()
 * @param {Object} diff 偏移值: -1
 * @param {Object} unit 偏移单位: days months
 * @param {Object} format YYYY-MM-DD HH:mm:ss
 */
export function dateFormatPlus(dateObj, diff, unit, format) {
  return moment(dateObj).add(diff, unit).format(format)
}

/**
 * 时间日期格式化,支持小Y
 * @param format yyyyMMddhhmmss
 * @returns {*}
 */
export function dateFormat(dateObj, format) {
  let date = {
    'M+': dateObj.getMonth() + 1,
    'd+': dateObj.getDate(),
    'h+': dateObj.getHours(),
    'm+': dateObj.getMinutes(),
    's+': dateObj.getSeconds(),
    'q+': Math.floor((dateObj.getMonth() + 3) / 3),
    'S+': dateObj.getMilliseconds()
  }
  if (/(y+)/i.test(format)) {
    format = format.replace(RegExp.$1, (dateObj.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in date) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ?
        date[k] : ('00' + date[k]).substr(('' + date[k]).length))
    }
  }
  return format
}


// 日期格式化
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

// 表单重置
export function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields();
  }
}

// 添加日期范围
export function addDateRange(params, dateRange) {
  var search = params;
  search.beginTime = "";
  search.endTime = "";
  if (null != dateRange && '' != dateRange) {
    search.beginTime = this.dateRange[0];
    search.endTime = this.dateRange[1];
  }
  return search;
}

// 回显数据字典
export function selectDictLabel(datas, value) {
  var actions = [];
  Object.keys(datas).map((key) => {
    if (datas[key].dictValue == ('' + value)) {
      actions.push(datas[key].dictLabel);
      return false;
    }
  })
  return actions.join('');
}

// 通用下载方法
export function download(fileName) {
  window.location.href = baseURL + "/common/download?fileName=" + encodeURI(fileName) + "&delete=" + true;
}

// 字符串格式化(%s )
export function sprintf(str) {
  var args = arguments,
    flag = true,
    i = 1;
  str = str.replace(/%s/g, function() {
    var arg = args[i++];
    if (typeof arg === 'undefined') {
      flag = false;
      return '';
    }
    return arg;
  });
  return flag ? str : '';
}

// 转换字符串，undefined,null等转化为""
export function praseStrEmpty(str) {
  if (!str || str == "undefined" || str == "null") {
    return "";
  }
  return str;
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 * @param {*} rootId 根Id 默认 0
 */
export function handleTree(data, id, parentId, children, rootId) {
  id = id || 'id'
  parentId = parentId || 'parentId'
  children = children || 'children'
  rootId = rootId || 0
  //对源数据深度克隆
  const cloneData = JSON.parse(JSON.stringify(data))
  //循环所有项
  const treeData = cloneData.filter(father => {
    let branchArr = cloneData.filter(child => {
      //返回每一项的子级数组
      return father[id] === child[parentId]
    });
    branchArr.length > 0 ? father.children = branchArr : '';
    //返回第一层
    return father[parentId] === rootId;
  });
  return treeData != '' ? treeData : data;
}

// 检验参数是否为空
export function isEmpty(val) {
  if (val === undefined) return true;
  if (val === null) return true;
  if (typeof val == 'object') {
    for (var name in val) {
      return false;
    }
    return true;
  }
  return val.length === 0;
}

// 设置/获取data-属性
export function getData (el, name, val) {
    let data = 'data-';
    // 传了val说明是要把data-属性值设为val,否则是获取
    if(val) {
        return el.setAttribute(data + name, val)
    } else {
        return el.getAttribute(data + name)
    }
}




/**
 * 创建随机字符串
 */
export function randomString(num) {
  let chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
    'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
  ]
  let res = ''
  for (let i = 0; i < num; i++) {
    var id = Math.ceil(Math.random() * 35)
    res += chars[id]
  }
  return res
}

export function toJSON(obj) {
  return JSON.stringify(obj);
}

export function uuid(){
  function S4() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  }
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}



export function uuidLink(){
  function S4() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  }
  return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
}
