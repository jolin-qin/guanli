import request from '@/utils/request'

// 查询生成表数据
export function listTable(query) {
  return request({
    url: '/tool/gen/list',
     method: 'post',
     data:JSON.stringify({
       tableName:"sys_table",
       paging:{
         pageSize:query.pageSize,
         pageNumber:query.pageNum
       },
       search:query.name,
       filters:{},
       orders:[]
     })
   })
 }

 // 创建db表
 export function createTable(data) {
   return request({
     url: '/tool/gen/create',
     method: 'post',
     data: data
   })
 }

// 查询db数据库列表
export function listDbTable(query) {
  return request({
    url: '/tool/gen/db/list',
    method: 'get',
    params: query
  })
}

// 查询表详细信息
export function getGenTable(tableId) {
  return request({
    url: '/tool/gen/' + tableId,
    method: 'get'
  })
}

// 修改代码生成信息
export function updateGenTable(data) {
  return request({
    url: '/tool/gen',
    method: 'put',
    data: data
  })
}

// 导入表
export function importTable(data) {
  return request({
    url: '/tool/gen/importTable',
    method: 'post',
    params: data
  })
}
// 预览生成代码
export function previewTable(tableId) {
  return request({
    url: '/tool/gen/preview/' + tableId,
    method: 'get'
  })
}
// 删除表数据
export function delTable(tableId) {
  return request({
    url: '/tool/gen/' + tableId,
    method: 'delete'
  })
}
