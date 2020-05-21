import request from '@/utils/request'

// 查询登录日志列表
export function list(query) {
  return request({
    url: '/system/logininfor/list',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_logininfor",
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

// 删除登录日志
export function delLogininfor(infoIds) {
  var ids=infoIds.map(item=>{
    return {info_id:item}
  })
  return request({
    url: '/system/logininfor/remove',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_logininfor",
      ids:ids
    })
  })
}

// 清空登录日志
export function cleanLogininfor() {
  return request({
    url: '/system/logininfor/clean',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_logininfor"
    })
  })
}

// 导出登录日志
export function exportLogininfor(query) {
  return request({
    url: '/system/logininfor/export',
    method: 'get',
    params: query
  })
}
