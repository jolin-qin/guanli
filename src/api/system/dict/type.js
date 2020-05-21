import request from '@/utils/request'

// 查询字典类型列表
export function listType(query) {
  return request({
    url: '/system/dict/type/list',
    method: 'post',
    data: JSON.stringify({
      tableName: "sys_dict_type",
      paging: {
        pageSize: query.pageSize,
        pageNumber: query.pageNum
      },
      search: query.name,
      filters: {},
      orders: []
    })
  })
}

// 查询字典类型详细
export function getType(dictId) {
  return request({
    url: '/system/dict/type/info',
    method: 'post',
    data: JSON.stringify({
      tableName: "sys_dict_type",
      columns: {
        "dict_id": dictId
      },
    })
  })
}

// 新增字典类型
export function addType(data) {
  return request({
    url: '/system/dict/type/add',
    method: 'post',
    data: JSON.stringify({
      tableName: "sys_dict_type",
      data: data
    })
  })
}

// 修改字典类型
export function updateType(data) {
  return request({
    url: '/system/dict/type/edit',
    method: 'post',
    data: JSON.stringify({
      tableName: "sys_dict_type",
      data: data
    })
  })
}

// 删除字典类型
export function delType(dictId) {
  return request({
    url: '/system/dict/type/remove',
    method: 'post',
    data: JSON.stringify({
      tableName: "sys_dict_type",
      ids: [{
        "dict_id": dictId
      }]
    })
  })
}

// 导出字典类型
export function exportType(query) {
  return request({
    url: '/system/dict/type/export',
    method: 'get',
    params: query
  })
}

// 获取字典选择框列表
export function optionselect() {
  return request({
    url: '/system/dict/type/optionselect',
    method: 'get'
  })
}
