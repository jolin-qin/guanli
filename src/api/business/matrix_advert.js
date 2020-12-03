import request from '@/utils/request'
import * as qpApi from '@/api/shuxin'

// 查询广告列表
export function listAdvert(query) {
    let data = qpApi.buildFilter('matrix_advert', query)
    if (query.dateRange && query.dateRange.length) {
      data.createTime = {
        type: 'between',
        from: query.dateRange[0],
        to: query.dateRange[1]
      }
    }
    return request({
        url: '/business/advert/list',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_advert",
            paging:{
                pageSize:query.pageSize,
                pageNumber:query.pageNum
            },
            filters: data,
            // orders:[]
            orders:[{column:"createTime",type:"desc"}]
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


// 修改产品
export function updatePricePlan(data) {
    return request({
        url: '/business/advert/updatePricePlan',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_advert_plan",
            data:data,
        })
    })
}
