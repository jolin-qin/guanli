import request from '@/utils/request'
import * as qpApi from '@/api/shuxin'

// 查询产品列表
export function listProduct(query) {
    return request({
        url: '/business/product/list',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_product",
            paging:{
                pageSize:query.pageSize,
                pageNumber:query.pageNum
            },
            filters:qpApi.buildFilter('matrix_product', query),
            orders:[]
        })
    })
}

// 查询产品详细
export function getProduct(id) {
    return request({
        url: '/business/product/info' ,
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_product",
            columns:{id:id}
        })
    })
}

// 新增产品
export function addProduct(data) {
    return request({
        url: '/business/product/add',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_product",
            data:data
        })
    })
}

// 修改产品
export function updateProduct(data) {
    return request({
        url: '/business/product/edit',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_product",
            data:data
        })
    })
}


// 修改产品
export function updateAttributeProduct(data) {
    return request({
        url: '/business/product/updateAttributeProduct',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_product",
            data:data
        })
    })
}


//删除产品
export function delProduct(id) {
    return request({
        url: '/business/product/delRemove',
        data:JSON.stringify({
            tableName:"matrix_product",
            ids:[{id:id}]
        }),
        method: 'post'
    })
}

// 导出产品
export function exportProduct(query) {
    return request({
        url: '/business/product/export',
        method: 'get',
        params: query
    })
}
