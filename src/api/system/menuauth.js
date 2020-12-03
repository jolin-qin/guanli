import request from '@/utils/request'
import * as shuxinTool from '@/utils/shuxin-tool'
import * as qpApi from '@/api/shuxin'

export function menuAuthGroupList() {
  return request({
    url: '/authConfig/menuAuthGroupList',
    method: 'post',
    data:JSON.stringify({})
  })
}

export function getMenuTreeData() {
  return request({
    url: '/authConfig/getMenuTreeData',
    method: 'post',
    data:JSON.stringify({})
  })
}

export function getMenuGroupAuth(groupId) {
  return request({
    url: '/authConfig/getMenuGroupAuth',
    method: 'post',
    data:JSON.stringify({groupId: groupId})
  })
}

export function delMenuGroupAuth(groupId) {
  return request({
    url: '/authConfig/deleteMenuGroupAuth',
    method: 'post',
    data:JSON.stringify({groupId: groupId})
  })
}

export function saveMenuGroupAuth(groupId, groupName, menuIds, authDatas) {
  return request({
    url: '/authConfig/saveMenuGroupAuth',
    method: 'post',
    data:JSON.stringify({groupId: groupId, groupName: groupName, menuIds: menuIds, authDatas: authDatas})
  })
}
