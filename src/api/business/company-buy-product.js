import request from '@/utils/request'
import * as qpApi from '@/api/shuxin'

// 查询产品分组列表
export function listBuyProduct(query) {
    return request({
        url: '/business/buyCompanyProduct/list',
        method: 'post',
        data:JSON.stringify({
            tableName:"wechat_buy_company_product",
            paging:{
                pageSize:query.pageSize,
                pageNumber:query.pageNum
            },
            filters:qpApi.buildFilter('wechat_buy_company_product', query),
            orders:[]
        })
    })
}


// 查询产品分组列表
export function listCompanyProduct(query) {
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
export function getBuyProduct(id) {
    return request({
        url: '/business/buyCompanyProduct/info' ,
        method: 'post',
        data:JSON.stringify({
            tableName:"wechat_buy_company_product",
            columns:{id:id}
        })
    })
}
// 新增产品分组
export function addBuyProduct(data) {
    return request({
        url: '/business/buyCompanyProduct/add',
        method: 'post',
        data:JSON.stringify({
            tableName:"wechat_buy_company_product",
            data:data
        })
    })
}

// 修改产品分组
export function updateBuyProduct(data) {
    return request({
        url: '/business/buyCompanyProduct/edit',
        method: 'post',
        data:JSON.stringify({
            tableName:"wechat_buy_company_product",
            data:data
        })
    })
}

//删除产品分组
export function delBuyProduct(id) {
    return request({
        url: '/business/buyCompanyProduct/delRemove',
        data:JSON.stringify({
            tableName:"wechat_buy_company_product",
            ids:[{id:id}]
        }),
        method: 'post'
    })
}

//删除产品分组
export function delCompanyProduct(id) {
    return request({
        url: '/business/company/delCompanyProduct',
        data:JSON.stringify({
            tableName:"wechat_company_info",
            ids:[{id:id}]
        }),
        method: 'post'
    })
}
