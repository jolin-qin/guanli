import request from '@/utils/request'
import * as qpApi from '@/api/shuxin'
import { praseStrEmpty } from "@/utils/shuxin-tool";
import * as shuxinTool from '@/utils/shuxin-tool'

// 查询用户列表
export function listUser(query) {
  return request({
    url: '/system/user/list',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_user",
      paging:{
        pageSize:query.pageSize,
        pageNumber:query.pageNum
      },
      search:query.name,
      filters: qpApi.buildFilter('sys_user', query),
      orders:[]
    })
  })
}

// 查询用户详细
export function getUser(userId) {
  return request({
    url: '/system/user/info',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_user",
      columns:{user_id:praseStrEmpty(userId)}
    })
  })
}

// 新增用户
export function addUser(data) {
  return request({
    url: '/system/user/add',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_user",
      data:data
    })
  })
}

// 修改用户
export function updateUser(data) {
  return request ({
    url: '/system/user/edit',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_user",
      data:data
    })
  })
}

// 删除用户
export function delUser(id) {
	if (shuxinTool.isEmpty(id)){
	    return;
	}
	var ids = [];
	var splitIds = (id + '').split(',');
	for (var i=0; i<splitIds.length; i++){
	  ids.push({user_id: splitIds[i]});
	}
  return request({
    url: '/system/user/remove',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_user",
      ids: ids
    })
  })
}

// 导出用户
export function exportUser(query) {
  return request({
    url: '/system/user/export',
    method: 'get',
    params: query
  })
}

// 用户密码重置
export function resetUserPwd(userId, password) {
  const data = {
    userId,
    password
  }
  return request({
    url: '/system/user/resetPwd',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_user",
      data:data
    })
  })
}

// 用户状态修改
export function changeUserStatus(userId, status) {
  const data = {
    userId,
    status
  }
  return request({
    url: '/system/user/changeStatus',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_user",
      data:data
    })
  })
}

// 查询用户个人信息
export function getUserProfile() {
  return request({
    url: '/system/user/profile',
    method: 'get'
  })
}

// 修改用户个人信息
export function updateUserProfile(data) {
  return request({
    url: '/system/user/profile/edit',
    method: 'post',
    data:JSON.stringify({
      tableName:"sys_user",
      data:data
    })
  })
}

// 用户密码重置
export function updateUserPwd(oldPassword, newPassword) {
  const data = {
    oldPassword,
    newPassword
  }
  return request({
    url: '/system/user/profile/updatePwd',
   method: 'post',
   data:JSON.stringify({
     tableName:"sys_user",
     data:data
   })
  })
}

// 用户头像上传
export function uploadAvatar(data) {
  return request({
    url: '/system/user/profile/avatar',
    method: 'post',
    data: data
  })
}

// 下载用户导入模板
export function importTemplate() {
  return request({
    url: '/system/user/importTemplate',
    method: 'get'
  })
}
