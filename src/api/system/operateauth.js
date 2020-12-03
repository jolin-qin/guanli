import request from '@/utils/request'
import * as shuxinTool from '@/utils/shuxin-tool'
import * as qpApi from '@/api/shuxin'

export function getOperateAuth() {
  return request({
    url: '/authConfig/getOperateAuth',
    method: 'post',
    data:JSON.stringify({})
  })
}

export function deleteOperateAuth(operateKey) {
  return request({
    url: '/authConfig/deleteOperateAuth',
    method: 'post',
    data:JSON.stringify({operateKey: operateKey})
  })
}

export function saveOperateAuth(operateKey, authDatas) {
  return request({
    url: '/authConfig/saveOperateAuth',
    method: 'post',
    data:JSON.stringify({operateKey: operateKey, authDatas: authDatas})
  })
}
