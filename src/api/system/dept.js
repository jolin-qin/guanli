import request from '@/utils/request'
import * as qpApi from '@/api/shuxin'

// 查询部门列表
export function listDept(query) {
  return request({
    url: '/system/dept/list',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_dept",
      search:query.name,
      filters: qpApi.buildFilter('sys_dept', query),
      orders:[]
    })
  })
}

// 查询部门详细
export function getDept(deptId) {
  return request({
    url: '/system/dept/info',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_dept",
      columns:{dept_id:deptId},
    })
  })
}

// 查询部门下拉树结构
export function treeselect() {
  return request({
    url: '/system/dept/treeselect',
    method: 'get'
  })
}

// 根据角色ID查询部门树结构
export function roleDeptTreeselect(roleId) {
  return request({
    url: '/system/dept/roleDeptTreeselect/' + roleId,
    method: 'get'
  })
}

// 新增部门
export function addDept(data) {
  return request({
    url: '/system/dept/add',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_dept",
      data:data
    })
  })
}

// 修改部门
export function updateDept(data) {
  return request({
    url: '/system/dept/edit',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_dept",
      data:data
    })
  })
}

// 删除部门
export function delDept(deptId) {
  return request({
    url: '/system/dept/remove',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_dept",
      ids:[{"dept_id":deptId}]
    })
  })
}
