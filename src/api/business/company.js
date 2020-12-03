import request from '@/utils/request'
import * as qpApi from '@/api/shuxin'

// 查询产品分组列表
export function listGroup(query) {
    return request({
        url: '/business/company/list',
        method: 'post',
        data:JSON.stringify({
            tableName:"wechat_company_info",
            paging:{
                pageSize:query.pageSize,
                pageNumber:query.pageNum
            },
            filters:qpApi.buildFilter('wechat_company_info', query),
            orders:[]
        })
    })
}

// 查询产品分组详细
export function getGroup(id) {
    return request({
        url: '/business/company/info' ,
        method: 'post',
        data:JSON.stringify({
            tableName:"wechat_company_info",
            columns:{id:id}
        })
    })
}

// 新增产品分组
export function addGroup(data) {
    return request({
        url: '/business/company/add',
        method: 'post',
        data:JSON.stringify({
            tableName:"wechat_company_info",
            data:data
        })
    })
}

// 修改产品分组
export function updateGroup(data) {
    return request({
        url: '/business/company/edit',
        method: 'post',
        data:JSON.stringify({
            tableName:"wechat_company_info",
            data:data
        })
    })
}

//删除产品分组
export function delGroup(id) {
    return request({
        url: '/business/company/delRemove',
        data:JSON.stringify({
            tableName:"wechat_company_info",
            ids:[{id:id}]
        }),
        method: 'post'
    })
}
