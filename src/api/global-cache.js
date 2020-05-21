//全局缓存对象
const globalCache = {}

const columnDataType = {
  AUTO: "AUTO", //自增
  NUM: "NUM", //整数
  FLOAT: "FLOAT", //小数
  STR: "TEXT", //字符串
  IMG: "IMG", //图片
  FILE: "FILE", //文件
  PWD: "PWD", //密码
  BOOL: "BOOL", //bool
  DATE: "DATE", //年月日
  TIME: "TIME", //时分秒
  DATE_TIME: "DATE_TIME", //年月日时分秒
  TEXT_AREA: "TEXT_AREA" //富文本
}


const ossRootPath = 'http://qingpu01.oss-cn-beijing.aliyuncs.com/'

export {
  globalCache,
  columnDataType,
  ossRootPath
}
