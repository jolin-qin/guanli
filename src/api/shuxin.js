import * as shuxinTool from '@/utils/shuxin-tool'
import request from '@/utils/request'
import * as globalCache from '@/api/global-cache'


// 重载后端缓存
export function reloadJsCache(){
  console.log('重载后端缓存');
  request({
    url: '/cache/reload',
    method: 'post'
  }).then(res=>{
    request({
      url: '/cache/initJsCache',
      method: 'post'
    }).then(result=>{
      console.log("reloadJsCache:",result)
      //缓存数据存储
      globalCache.globalCache.shopCache = result.data
    });
  })

}

// 获取后端缓存
export const initJsCache = () => {
  return request({
    url: '/cache/initJsCache',
    method: 'post'
  })
}

//递归查找子节点
function findChildren(treeNode,nodeList,table){
   var columns = table.columns
  var childColumn= table.childColumn
  var parentColumn= table.parentColumn

var children=[]

 for(var i in nodeList){
   var node=nodeList[i]
   //console.log(`node[parentColumn]=${node[parentColumn]}  treeNode[childColumn]=${treeNode[childColumn]} node=`)
   if(treeNode[childColumn]==node[parentColumn]){
     children.push(findChildren(node,nodeList,table));
   }
 }

 var formatRow = {};
if(children.length>0){
  formatRow.children=children;
}

 //formatRow.rowData = treeNode;
 for (var j = 0; j < columns.length; j++) {
   formatRow[columns[j].columnAlias] = gridText(columns[j], treeNode[columns[j].columnAlias], treeNode);
 }


  //console.log('-->节点:',treeNode);
  return formatRow;
}

// 格式化服务端数据
export function shuxinDataFormat(tableName, rows,isTree) {
  if (shuxinTool.isEmpty(rows)){
      return rows;
  }
  //console.log("tableName=" + tableName, rows)
  //console.log('buildGridData globalCache.globalCache:', globalCache.globalCache);

  // var tableId = this.getTableNameByAlias(tableName);
  var table = getTable(tableName);
  if (shuxinTool.isEmpty(table) || shuxinTool.isEmpty(table.columns)) {
    return rows;
  }
  var columns = table.columns;
  var formatRows = [];
  console.log('树形结构:'+isTree);
  //是树形结构
  if(isTree){
    var childColumn= table.childColumn
    var parentColumn= table.parentColumn

    for(var index in rows){
      //console.log(`  parentColumn=${rows[index]} rows[index]=`,rows[index])
      if(0==rows[index][parentColumn]){
        formatRows.push(findChildren(rows[index],rows,table));
      }
    }
    console.log('树形结构数据 formatRows：',formatRows);
    return formatRows;
  }

  for (var i = 0; i < rows.length; i++) {
    var formatRow = {};
    formatRow.rowData = rows[i];
    for (var j = 0; j < columns.length; j++) {
      formatRow[columns[j].columnAlias] = gridText(columns[j], rows[i][columns[j].columnAlias], rows[i]);
    }
    formatRows.push(formatRow);
  }
  return formatRows;
}

export function gridText(column, value, row) {
  function formatDateTime(date){
    if (shuxinTool.isEmpty(date)){
      return '';
    }
    try{
        var formatDate = new Date(date);
        var fullYear = formatDate.getFullYear();
        var month = formatDate.getMonth() + 1;
        var day = formatDate.getDate();
        var hour = formatDate.getHours();
        var min = formatDate.getMinutes();
        var ss = formatDate.getSeconds();
        if (month < 10){
            month = '0' + month;
        }
        if (day < 10){
            day = '0' + day;
        }
        if (hour < 10){
            hour = '0' + hour;
        }
        if (min < 10){
            min = '0' + min;
        }
        if (ss < 10){
            ss = '0' + ss;
        }
        return fullYear + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + ss;
    }catch (e){
        return '';
    }
  }
  function formatRefTable(column, row, value) {
    var text;
    if (!shuxinTool.isEmpty(refTable.nameColumn)) {
      text = row[ref][refTable.nameColumn];
    } else {
      text = value;
    }
    return '<a href="#" tableName="' + refTable.tableId + '" idValue="' + value + '" class="fn-grid-link">' + text +
      '</a>';
  }

  function dictColor(dictDetail) {
    return '<span class="badge" style="background-color: ' + dictDetail.cssClass + ';color:#FFFFFF; padding: 5px 10px;border-radius: 5px;">' + dictDetail.dictLabel +
      '</span>';
  }
  var dict, refTable;
  var time = new Date().getTime();
  var formatText = '';
  switch (column.dataType) {
    case globalCache.columnDataType.NUM:
    case globalCache.columnDataType.STR:
      if (!shuxinTool.isEmpty(column.refDict)) {
        dict = globalCache.globalCache.shopCache.dictCache[column.refDict];
        if (shuxinTool.isEmpty(dict) || shuxinTool.isEmpty(dict.details)) {
          formatText = value;
          break;
        }
        for (var i = 0; i < dict.details.length; i++) {
          if (value == dict.details[i].dictValue) {
            if (shuxinTool.isEmpty(dict.details[i].cssClass)) {
              formatText = dict.details[i].dictLabel;
              break;
            } else {
              formatText = dictColor(dict.details[i]);
              break;
            }
          }
        }
      } else if (!shuxinTool.isEmpty(column.refTable)) {
        refTable = getTable(column.refTable);
        if (shuxinTool.isEmpty(refTable)) {
          formatText = value;
        } else if (!shuxinTool.isEmpty(refTable.nameColumn)) {
          var ref = column.columnName + '.ref';
          if (shuxinTool.isEmpty(row[ref])) {
            formatText = value;
          } else {
            formatText = row[ref][refTable.nameColumn];
            //formatText = formatRefTable(column, row, value);
          }
        } else {
          formatText = value;
          //formatText = formatRefTable(column, row, value);
        }
      } else {
        formatText = value;
      }
      break;
    case globalCache.columnDataType.AUTO:
    case globalCache.columnDataType.FLOAT:
      formatText = value;
      break;
    case globalCache.columnDataType.IMG:
      if (shuxinTool.isEmpty(value))
        formatText = '';
      else {
        var name = value.substr(value.lastIndexOf('/') + 1);
        formatText = '<img src="' + value + '?time=' + time + '" style="width: 40px; height: 40px"/>';
      }
      break;
    case globalCache.columnDataType.FILE:
      formatText = value;
      break;
    case globalCache.columnDataType.PWD:
      formatText = '******';
      break;
    case globalCache.columnDataType.BOOL:
      formatText = value;
      break;
    case globalCache.columnDataType.DATE:
    case globalCache.columnDataType.TIME:
    case globalCache.columnDataType.TEXT_AREA:
      formatText = value;
      break;
    case globalCache.columnDataType.DATE_TIME:
       formatText = formatDateTime(value);
      break;

  }
  return formatText;
}

export function getTable(tableName) {
  return globalCache.globalCache.shopCache.tableCache[tableName];
}

export function getTableNameByAlias(alias) {
  var tables = globalCache.globalCache.shopCache.tableCache;
  for (var key in tables) {
    if (tables[key].tableAlias == alias) {
      return tables[key].tableId;
    }
  }
}
//封装查询条件
export function buildFilter(tableName, query){
  if (shuxinTool.isEmpty(query)){
    return {};
  }
  var table = globalCache.globalCache.shopCache.tableCache[tableName];
  var filter = {};
  var columnMap = table.columnMap;
  var hasColumnFlag = false;
  var column;
  for(var key in query) {
    hasColumnFlag = false;
    if (shuxinTool.isEmpty(query[key])) {
      continue;
    }
    for(var columnKey in columnMap) {
      if (columnMap[columnKey].columnAlias == key){
        hasColumnFlag = true;
        column = columnMap[columnKey];
        break;
      }
    }
    if (!hasColumnFlag){
      continue;
    }
    //范围字段
    if (query[key] instanceof Array){
      if (column.dataType == "DATE_TIME" || column.dataType == "DATE"){
        if (!shuxinTool.isEmpty(query[key]) && !shuxinTool.isEmpty(query[key][0])){
          filter[key] = {};
          filter[key].type = 'between';
          filter[key].from = query[key][0];
          if (!shuxinTool.isEmpty(query[key][1])){
            filter[key].to = query[key][1];
          }
        }
      } else {
        filter[key] = {};
        filter[key].type = 'in';
        filter[key].value = query[key];
      }
    } else {
      filter[key] = {};
      filter[key].value = query[key];
      if (!shuxinTool.isEmpty(column) && column.dataType == 'TEXT' && shuxinTool.isEmpty(column.refTable) && shuxinTool.isEmpty(column.refDict)){ //普通字符串字段为like
        filter[key].type = 'like';
      }else{
        filter[key].type = 'eq';
      }
    }
  }
  return filter;
}
//下拉框检索
export function inputSelectList(tableName, columnName, query, callback, params){
    function getUrl(tableName, columnName, query){
      /* function getParamList(sql) {
          var regexp = /[#\$]\{([^}]+)}/g;
          var match;
          var names = [];
          do {
              match = regexp.exec(sql);
              if (!match)
                  break;
              names.push(match[1]);
          } while (true);
          return names;
      } */
      var queryText = '';
      if(typeof query == 'string') {
        queryText = query;
      }
      var refFilter = column.refFilter;
      if (shuxinTool.isEmpty(refFilter)){
          return '/input/select/filter?param=' + '' + '&tableName=' + encodeURI(tableName) + '&columnName=' + encodeURI(columnName) + '&wd=' + queryText;
      }
     /* var paramList = getParamList(refFilter);
      var filterParam = {};
      if (!shuxinTool.isEmpty(paramList)){
          var sqlParamColumn;
          for (var i=0; i<paramList.length; i++){
              sqlParamColumn = table.columnMap[paramList[i]];
              var value = $(node).parents('.form-horizontal').find('input[name="' + sqlParamColumn.alias + '"]').val();
              filterParam[sqlParamColumn.columnName] = value;
          }
      } */
      if (shuxinTool.isEmpty(params)){
        params = '';
      }
      return '/input/select/filter?param=' + encodeURI(params) + '&tableName=' + encodeURI(tableName) +
          '&columnName=' + encodeURI(columnName) + '&wd=' + queryText;
    }
    function buildResultData(column, data){
      if (shuxinTool.isEmpty(data)){
        return [];
      }
      //取关联表的id与名称列封装到数据中. 页面直接显示
      var targetColumn, idColumn;   //显示的值与保存的值
      var refTableName = column.refTable;
      if (shuxinTool.isEmpty(refTableName)){
          return [];
      }else {
          var refTable = globalCache.globalCache.shopCache.tableCache[refTableName];
          if (shuxinTool.isEmpty(refTable.nameColumn)) {
              idColumn = targetColumn = refTable.idColumns[0];
          } else {
              targetColumn = refTable.nameColumn;
              idColumn = refTable.idColumns[0];
          }
      }
      //构造通用名称列与ID列
      for (var i=0; i<data.length; i++){
          data[i]['targetNameColumnInputSelect'] = data[i][targetColumn];
          data[i]['targetIdColumnInputSelect'] = data[i][idColumn];
      }
      return data;
    }


    var table = globalCache.globalCache.shopCache.tableCache[tableName];
    // console.log('inputselecttable:', table);
    if (shuxinTool.isEmpty(table)){
        return;
    }
    var column = table.columnMap[columnName];
    if (shuxinTool.isEmpty(column)){
      console.error("column is null!");
      return;
    }
    var url = getUrl(tableName, columnName, query);
    request({url: url, method: 'post'}).then(res=>{
      callback(buildResultData(column, res.data));
    });
}
// 给日期加上两个"-"号,比如20200520变成2020-05-20
export function composeNewStr(str) {
  const things = [
    { thing: "-", sp: 4 },
    { thing: "-", sp: 6 }
  ]
  const strArr = str.split("");
  things.forEach(item => {
    const { sp: index, thing = "" } = item;
    strArr[index] = thing + (strArr[index] || "");
  });
  return strArr.join("");
}
// 把毫秒数转换为年-月-日
function calculateDates(result) {
  let Y = result.getFullYear()
  let M = result.getMonth() + 1 < 10 ? '0' + (result.getMonth() + 1) : result.getMonth() + 1
  let D = result.getDate() < 10 ? '0' + result.getDate() : result.getDate()
  let srtDate = Y + '-' + M + '-' + D
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
