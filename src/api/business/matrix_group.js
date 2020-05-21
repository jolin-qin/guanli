import request from '@/utils/request'
import * as qpApi from '@/api/shuxin'

// 查询产品分组列表
export function listGroup(query) {
    return request({
        url: '/business/group/list',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_group",
            paging:{
                pageSize:query.pageSize,
                pageNumber:query.pageNum
            },
            filters:qpApi.buildFilter('matrix_group', query),
            orders:[]
        })
    })
}

// 查询产品分组详细
export function getGroup(id) {
    return request({
        url: '/business/group/info' ,
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_group",
            columns:{id:id}
        })
    })
}

// 新增产品分组
export function addGroup(data) {
    return request({
        url: '/business/group/add',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_group",
            data:data
        })
    })
}

// 修改产品分组
export function updateGroup(data) {
    return request({
        url: '/business/group/edit',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_group",
            data:data
        })
    })
}

//删除产品分组
export function delGroup(id) {
    return request({
        url: '/business/group/delRemove',
        data:JSON.stringify({
            tableName:"matrix_group",
            ids:[{id:id}]
        }),
        method: 'post'
    })
}

// 导出产品分组
export function exportGroup(query) {
    return request({
        url: '/business/group/export',
        method: 'get',
        params: query
    })
}
