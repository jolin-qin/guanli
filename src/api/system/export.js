import request from '@/utils/request'
import * as shuxinTool from '@/utils/shuxin-tool'
import * as qpApi from '@/api/shuxin'

// 查询 列表
export function listExport(query) {
  return request({
    url: '/crud/list',
    method: 'post',
    data:JSON.stringify({
      tableName:"s_export",
      paging:{
        pageSize:query.pageSize,
        pageNumber:query.pageNum
      },
      search:query.search,
      filters: qpApi.buildFilter('s_export', query),
      orders:[]
    })
  })
}

// 查询 详细
export function getExport(id) {
  return request({
    url: '/crud/info',
    method: 'post',
    data:JSON.stringify({
      tableName:"s_export",
      columns:{id:id},
    })
  })
}

// 新增
export function addExport(data) {
  return request({
    url: '/crud/add',
    method: 'post',
    data:JSON.stringify({
      tableName:"s_export",
      data:data
    })
  })
}

// 修改
export function updateExport(data) {
  return request({
    url: '/crud/edit',
    method: 'post',
    data:JSON.stringify({
      tableName:"s_export",
      data:data
    })
  })
}

// 删除
export function delExport(id) {
  if (shuxinTool.isEmpty(id)){
      return;
  }
  var ids = [];
  var splitIds = (id + '').split(',');
  for (var i=0; i<splitIds.length; i++){
    ids.push({id: splitIds[i]});
  }
  return request({
    url: '/crud/remove',
    method: 'post',
    data:JSON.stringify({
      tableName:"s_export",
      ids: ids
    })
  })
}
