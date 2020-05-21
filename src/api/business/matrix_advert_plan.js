import request from '@/utils/request'
import * as qpApi from '@/api/shuxin'
 import * as shuxinTool from '@/utils/shuxin-tool'

// 查询广告投放计划列表
export function listPlan(query) {
    return request({
        url: '/business/plan/list',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_advert_plan",
            paging:{
                pageSize:query.pageSize,
                pageNumber:query.pageNum
            },
             filters:qpApi.buildFilter('matrix_advert_plan', query),
            orders:[]
        })
    })
}

// 查询广告投放计划详细
export function getPlan(id) {
    return request({
        url: '/business/plan/info' ,
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_advert_plan",
            columns:{id:id}
        })
    })
}

// 新增广告投放计划
export function addPlan(data) {
    return request({
        url: '/business/plan/add',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_advert_plan",
            data:data
        })
    })
}

// 修改广告投放计划
export function updatePlan(data) {
    return request({
        url: '/business/plan/edit',
        method: 'post',
        data:JSON.stringify({
            tableName:"matrix_advert_plan",
            data:data
        })
    })
}

//删除广告投放计划
export function delPlan(id) {
    if (shuxinTool.isEmpty(id)){
        return;
    }
    var ids = [];
    for (var i=0; i<id.length; i++){
      ids.push({id: id[i]});
    }
    return request({
        url: '/business/plan/remove',
        data:JSON.stringify({
            tableName:"matrix_advert_plan",
            ids:ids
        }),
        method: 'post'
    })
}

// 导出广告投放计划
export function exportPlan(query) {
    return request({
        url: '/business/plan/export',
        method: 'get',
        params: query
    })
}