import request from '@/utils/request'
import * as qpApi from '@/api/shuxin'

// 查询定时任务调度列表
export function listJob(query) {
  return request({
    url: '/monitor/job/list',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_job",
      paging:{
        pageSize:query.pageSize,
        pageNumber:query.pageNum
      },
      search:query.jobName,
      filters: qpApi.buildFilter('sys_job', query),
      orders:[]
    })
  })
}

// 查询定时任务调度详细
export function getJob(jobIds) {
  var ids=jobIds.map(item=>{
    return {"job_id":item}
  })
  return request({
    url: '/monitor/job/info',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_job",
      columns:ids[0],
    })
  })
}

// 新增定时任务调度
export function addJob(data) {
  return request({
    url: '/monitor/job/add',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_job",
      data:data
    })
  })
}

// 修改定时任务调度
export function updateJob(data) {
  return request({
    url: '/monitor/job/edit',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_job",
      data:data
    })
  })
}

// 删除定时任务调度
export function delJob(jobIds) {
  var ids=jobIds.map(item=>{
    return {"job_id":item}
  })
  return request({
    url: '/monitor/job/remove',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_job",
      ids:ids
    })
  })
}

// 导出定时任务调度
export function exportJob(query) {
  return request({
    url: '/monitor/job/export',
    method: 'get',
    params: query
  })
}

// 任务状态修改
export function changeJobStatus(jobId, status) {
  return request({
    url: '/monitor/job/changeStatus',
    method: 'post',
    data:JSON.stringify({
      "jobId":jobId,
      "status":status
    })
  })
}

// 定时任务立即执行一次
export function runJob(jobId, jobGroup) {
  return request({
    url: '/monitor/job/run',
    method: 'post',
    data:JSON.stringify({
      "jobId":jobId,
      "jobGroup":jobGroup
    })
  })
}
