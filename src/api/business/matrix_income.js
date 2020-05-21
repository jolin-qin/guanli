import request from '@/utils/request'
import * as qpApi from '@/api/shuxin'

// 查询导出收入列表列表
export function listIncome(query) {
    return request({
        url: '/business/income/list',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_income",
            paging:{
                pageSize:query.pageSize,
                pageNumber:query.pageNum
            },
            filters:qpApi.buildFilter('matrix_income', query),
            orders:[]
        })
    })
}

// 查询导出收入列表详细
export function getIncome(id) {
    return request({
        url: '/business/income/info' ,
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_income",
            columns:{id:id}
        })
    })
}

// 新增导出收入列表
export function addIncome(data) {
    return request({
        url: '/business/income/add',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_income",
            data:data
        })
    })
}

// 修改导出收入列表
export function updateIncome(data) {
    return request({
        url: '/business/income/edit',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_income",
            data:data
        })
    })
}

//删除导出收入列表
export function delIncome(id) {
    return request({
        url: '/business/income/delRemove',
        data:JSON.stringify({
            tableName:"matrix_income",
            ids:[{id:id}]
        }),
        method: 'post'
    })
}

// 导出导出收入列表
export function exportIncome(query) {
    return request({
        url: '/business/income/export',
        method: 'get',
        params: query
    })
}
