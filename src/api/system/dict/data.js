import request from '@/utils/request'

// 查询字典数据列表
export function listData(query) {
  console.log('query:',query)
  return request({
    url: '/system/dict/data/list',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_dict_data",
      paging:{
        pageSize:query.pageSize,
        pageNumber:query.pageNum
      },
      search:query.dictType,
      filters:{},
      orders:[]
    })
  })
}

// 查询字典数据详细
export function getData(dictCode) {
  return request({
    url: '/system/dict/data/info',
    method: 'post',
    data: JSON.stringify({
      tableName: "sys_dict_data",
      columns: {
        "dict_code": dictCode
      },
    })
  })
}

// 根据字典类型查询字典数据信息
export function getDicts(dictType) {
  return request({
    url: '/system/dict/data/dictType/' + dictType,
    method: 'get'
  })
}

// 新增字典数据
export function addData(data) {
  return request({
    url: '/system/dict/data/add',
    method: 'post',
    data: JSON.stringify({
      tableName: "sys_dict_data",
      data: data
    })
  })
}

// 修改字典数据
export function updateData(data) {
  return request({
    url: '/system/dict/data/edit',
    method: 'post',
    data: JSON.stringify({
      tableName: "sys_dict_data",
      data: data
    })
  })
}

// 删除字典数据
export function delData(dictCode) {
  return request({
    url: '/system/dict/data/remove',
    method: 'post',
    data: JSON.stringify({
      tableName: "sys_dict_type",
      ids: [{
        "dict_code": dictCode
      }]
    })
  })
}

// 导出字典数据
export function exportData(query) {
  return request({
    url: '/system/dict/data/export',
    method: 'get',
    params: query
  })
}
