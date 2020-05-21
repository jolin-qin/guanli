import request from '@/utils/request'



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

// 修改代码生成信息
export function updateSysTable(data) {
  return request({
    url: '/tool/systable/table/edit',
    method: 'post',
    data: data
  })
}


// 删除表数据
export function delSysTable(tableId) {
  return request({
    url: '/tool/gen/' + tableId,
    method: 'delete'
  })
}
