import request from '@/utils/request'

// 查询在线用户列表
export function list(query) {
  return request({
    url: '/monitor/online/list',
    method: 'post',
    data:JSON.stringify({
      paging:{
        pageSize:query.pageSize,
        pageNumber:query.pageNum
      },
      params:{"ipaddr":query.ipaddr,"userName":query.userName}
    })
  })
}

// 强退用户
export function forceLogout(tokenId) {
  return request({
    url: '/monitor/online/forcelogout/' + tokenId,
    method: 'post'
  })
}
