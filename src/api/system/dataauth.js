import request from '@/utils/request'
import * as shuxinTool from '@/utils/shuxin-tool'
import * as qpApi from '@/api/shuxin'

export function getDataAuth() {
  return request({
    url: '/authConfig/getDataAuth',
    method: 'post',
    data:JSON.stringify({})
  })
}

export function selectTable(tableName) {
  return request({
    url: '/authConfig/selectTable',
    method: 'post',
    data:JSON.stringify({tableName: tableName})
  })
}

export function deleteDataGroupAuth(tableName) {
  return request({
    url: '/authConfig/deleteDataGroupAuth',
    method: 'post',
    data:JSON.stringify({tableName: tableName})
  })
}

export function saveDataGroupAuth(tableName, authDatas) {
  return request({
    url: '/authConfig/saveDataGroupAuth',
    method: 'post',
    data:JSON.stringify({tableName: tableName, authDatas: authDatas})
  })
}
