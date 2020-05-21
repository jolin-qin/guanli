import request from '@/utils/request'
import * as qpApi from '@/api/shuxin'

// 查询广告图片列表
export function listImg(query) {
    return request({
        url: '/business/img/list',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_advert_img",
            paging:{
                pageSize:query.pageSize,
                pageNumber:query.pageNum
            },
            filters:qpApi.buildFilter('matrix_advert_img', query),
            orders:[]
        })
    })
}

// 查询广告图片详细
export function getImg(id) {
    return request({
        url: '/business/img/info' ,
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_advert_img",
            columns:{id:id}
        })
    })
}

// 新增广告图片
export function addImg(data) {
    return request({
        url: '/business/img/add',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_advert_img",
            data:data
        })
    })
}

// 修改广告图片
export function updateImg(data) {
    return request({
        url: '/business/img/edit',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_advert_img",
            data:data
        })
    })
}

//删除广告图片
export function delImg(id) {
    return request({
        url: '/business/img/remove',
        data:JSON.stringify({
            tableName:"matrix_advert_img",
            ids:[{id:id}]
        }),
        method: 'post'
    })
}

// 导出广告图片
export function exportImg(query) {
    return request({
        url: '/business/img/export',
        method: 'get',
        params: query
    })
}
