import request from '@/utils/request'
import * as shuxinTool from '@/utils/shuxin-tool'

// 查询角色列表
export function listRole(query) {
  return request({
    url: '/system/role/list',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_role",
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

// 查询角色详细
export function getRole(roleId) {
  return request({
    url: '/system/role/info',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_role",
      columns:{role_id:roleId},
    })
  })
}

// 新增角色
export function addRole(data) {
  return request({
    url: '/system/role/add',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_role",
      data:data
    })
  })
}

// 修改角色
export function updateRole(data) {
  return request({
    url: '/system/role/edit',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_role",
      data:data
    })
  })
}

// 删除角色
export function delRole(id) {
  if (shuxinTool.isEmpty(id)){
      return;
  }
  var ids = [];
  var splitIds = (id + '').split(',');
  for (var i=0; i<splitIds.length; i++){
    ids.push({role_id: splitIds[i]});
  }
  return request({
    url: '/system/role/remove',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_role",
      ids: ids
    })
  })
}

// 导出角色
export function exportRole(query) {
  return request({
    url: '/system/role/export',
    method: 'get',
    params: query
  })
}
