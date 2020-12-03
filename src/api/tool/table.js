import request from '@/utils/request'


 // 创建db表
 export function createTable(data) {
   return request({
     url: '/tool/systable/create',
     method: 'post',
     data: data
   })
 }

// 查询表下拉列表
export function tableOptionSelect() {
  return request({
    url: '/tool/systable/table/optionselect',
    method: 'get'
  })
}

// 查询表列表
export function listSysTable(query) {
  return request({
    url: '/tool/systable/table/list',
    method: 'get',
    params: query
  })
}

// 查询表详细信息
export function getSysTable(tableId) {
  return request({
    url: '/tool/systable/table/' + tableId,
    method: 'get'
  })
}


// 创建或修改表信息
export function createOrEditSysTable(data) {
  return request({
    url: '/tool/systable/table/createOrEdit',
    method: 'post',
    data: data
  })
}

// 修改表信息
export function updateSysTable(data) {
  return request({
    url: '/tool/systable/table/edit',
    method: 'post',
    data: data
  })
}


// 删除表数据
export function delSysTable(tableIds) {
  return request({
    url: '/tool/systable/remove/' + tableIds,
    method: 'post'
  })
}


// 查询字段列表
export function listSysTableColumn(data) {
  return request({
    url: '/tool/systable/column/list',
    method: 'post',
    data: data
  })
}

// 删除字段数据
export function delSysTableColumn(columnId) {
  return request({
    url: '/tool/systable/column/remove/' + columnId,
    method: 'post'
  })
}


// 新增字段
export function addSysTableColumn(data) {
  return request({
    url: '/tool/systable/column/add',
    method: 'post',
    data: data
  })
}


// 新增校验规则
export function addCheckTable(data) {
  return request({
    url: '/tool/systable/check/add',
    method: 'post',
    data: data
  })
}


// 查询校验规则列表
export function listCheckTable(data) {
  return request({
    url: '/tool/systable/check/list',
    method: 'post',
    data: data
  })
}
