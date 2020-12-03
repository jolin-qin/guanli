import request from '@/utils/request'
import * as qpApi from '@/api/shuxin'

// 查询产品分组列表
export function listLtv(query) {
    return request({
        url: '/weeklyLtv/list',
        method: 'post',
        data:JSON.stringify({
            tableName:"wechat_weekly_ltv",
            paging:{
              pageSize:query.pageSize,
              pageNumber:query.pageNum
            },
            filters:qpApi.buildFilter('wechat_weekly_ltv', query),
            orders:[]
        })
    })
}

// 查询产品分组详细
export function getLtv(id) {
    return request({
        url: '/weeklyLtv/info' ,
        method: 'post',
        data:JSON.stringify({
            tableName:"wechat_weekly_ltv",
            columns:{id:id}
        })
    })
}

// 新增产品分组
export function addLtv(data) {
    return request({
        url: '/weeklyLtv/add',
        method: 'post',
        data:JSON.stringify({
            tableName:"wechat_weekly_ltv",
            data:data
        })
    })
}

// 修改产品分组
export function updateLtv(data) {
    return request({
        url: '/weeklyLtv/edit',
        method: 'post',
        data:JSON.stringify({
            tableName:"wechat_weekly_ltv",
            data:data
        })
    })
}

//删除产品分组
export function delLtv(id) {
    return request({
        url: '/weeklyLtv/remove',
        data:JSON.stringify({
            tableName:"wechat_weekly_ltv",
            ids:[{id:id}]
        }),
        method: 'post'
    })
}
