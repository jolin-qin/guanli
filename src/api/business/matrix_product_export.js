import request from '@/utils/request'
import * as qpApi from '@/api/shuxin'

// 查询产品导出配置列表
export function listExport(query) {
    return request({
        url: '/business/export/list',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_product_export",
            paging:{
                pageSize:query.pageSize,
                pageNumber:query.pageNum
            },
             filters:qpApi.buildFilter('matrix_product_export', query),
            orders:[]
        })
    })
}

// 查询产品导出配置详细
export function getExport(id) {
    return request({
        url: '/business/export/info' ,
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_product_export",
            columns:{id:id}
        })
    })
}

// 新增产品导出配置
export function addExport(data) {
    return request({
        url: '/business/export/add',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_product_export",
            data:data
        })
    })
}

// 修改产品导出配置
export function updateExport(data) {
    return request({
        url: '/business/export/edit',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_product_export",
            data:data
        })
    })
}

//删除产品导出配置
export function delExport(id) {
    return request({
        url: '/business/export/remove',
        data:JSON.stringify({
            tableName:"matrix_product_export",
            ids:[{id:id}]
        }),
        method: 'post'
    })
}

// 导出产品导出配置
export function exportExport(query) {
    return request({
        url: '/business/export/export',
        method: 'get',
        params: query
    })
}