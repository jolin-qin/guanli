import request from '@/utils/request'

// 查询调度日志列表
export function listJobLog(query) {
  return request({
    url: '/monitor/jobLog/list',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_job_log",
      paging:{
        pageSize:query.pageSize,
        pageNumber:query.pageNum
      },
      search:query.name,
      orders:[]
    })
  })
}

// 删除调度日志
export function delJobLog(jobLogIds) {
  var ids=jobLogIds.map(id=>{
    return {job_log_id:id}
  })

  return request({
    url: '/monitor/jobLog/remove',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_job_log",
      ids: ids
    })
  })
}

// 清空调度日志
export function cleanJobLog() {
  return request({
    url: '/monitor/jobLog/clean',
    method: 'post'
  })
}

// 导出调度日志
export function exportJobLog(query) {
  return request({
    url: '/monitor/jobLog/export',
    method: 'get',
    params: query
  })
}
