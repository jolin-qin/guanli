import request from '@/utils/request'

// 查询操作日志列表
export function list(query) {
  return request({
    url: '/system/operlog/list',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_oper_log",
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

// 删除操作日志
export function delOperlog(operIds) {
  var ids=operIds.map(id=>{
    return {oper_id:id}
  })
  return request({
    url: '/system/operlog/remove',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_oper_log",
      ids:ids
    })
  })
}

// 清空操作日志
export function cleanOperlog() {
  return request({
    url: '/system/operlog/clean',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_oper_log"
    })
  })
}

// 导出操作日志
export function exportOperlog(query) {
  return request({
    url: '/system/operlog/export',
    method: 'get',
    params: query
  })
}