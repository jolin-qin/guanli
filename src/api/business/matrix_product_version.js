import request from '@/utils/request'
import * as qpApi from '@/api/shuxin'

// 查询产品版本管理列表
export function listVersion(query) {
    return request({
        url: '/business/version/list',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_product_version",
            paging:{
                pageSize:query.pageSize,
                pageNumber:query.pageNum
            },
            filters:qpApi.buildFilter('matrix_product_version', query),
            orders:[]
        })
    })
}

// 查询产品版本管理详细
export function getVersion(id) {
    return request({
        url: '/business/version/info' ,
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_product_version",
            columns:{id:id}
        })
    })
}

// 新增产品版本管理
export function addVersion(data) {
    return request({
        url: '/business/version/add',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_product_version",
            data:data
        })
    })
}

// 修改产品版本管理
export function updateVersion(data) {
    return request({
        url: '/business/version/edit',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_product_version",
            data:data
        })
    })
}

//删除产品版本管理
export function delVersion(id) {
    return request({
        url: '/business/version/remove',
        data:JSON.stringify({
            tableName:"matrix_product_version",
            ids:[{id:id}]
        }),
        method: 'post'
    })
}

// 导出产品版本管理
export function exportVersion(query) {
    return request({
        url: '/business/version/export',
        method: 'get',
        params: query
    })
}
