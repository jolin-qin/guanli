import request from '@/utils/request'
import * as qpApi from '@/api/shuxin'

// 查询广告列表
export function listAdvert(query) {
    return request({
        url: '/business/advert/list',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_advert",
            paging:{
                pageSize:query.pageSize,
                pageNumber:query.pageNum
            },
            filters:qpApi.buildFilter('matrix_advert', query),
            orders:[]
        })
    })
}

// 查询广告详细
export function getAdvert(id) {
    return request({
        url: '/business/advert/info' ,
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_advert",
            columns:{id:id}
        })
    })
}

// 新增广告
export function addAdvert(data) {
    return request({
        url: '/business/advert/add',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_advert",
            data:data
        })
    })
}

// 修改广告
export function updateAdvert(data) {
    return request({
        url: '/business/advert/edit',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_advert",
            data:data
        })
    })
}

//删除广告
export function delAdvert(id) {
    return request({
        url: '/business/advert/delRemove',
        data:JSON.stringify({
            tableName:"matrix_advert",
            ids:[{id:id}]
        }),
        method: 'post'
    })
}

// 导出广告
export function exportAdvert(query) {
    return request({
        url: '/business/advert/export',
        method: 'get',
        params: query
    })
}
