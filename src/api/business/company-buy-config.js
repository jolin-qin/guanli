import request from '@/utils/request'
import * as qpApi from '@/api/shuxin'

// 查询产品分组列表
export function listGroup(query) {
    let data = qpApi.buildFilter('wechat_buy_product_config', query)
    if (query.dateRange.length) {
      data.createTime = {
        type: 'between',
        from: query.dateRange[0],
        to: query.dateRange[1]
      }
    }
    return request({
        url: '/business/buyCompanyConfig/list',
        method: 'post',
        data:JSON.stringify({
            tableName:"wechat_buy_product_config",
            paging:{
                pageSize: query.pageSize,
                pageNumber: query.pageNum
            },
            // filters:qpApi.buildFilter('wechat_buy_product_config', query),
            filters: data,
            orders:[]
        })
    })
}

// 查询产品分组详细
export function getGroup(id) {
    return request({
        url: '/business/buyCompanyConfig/info' ,
        method: 'post',
        data:JSON.stringify({
            tableName:"wechat_buy_product_config",
            columns:{id:id}
        })
    })
}

// 新增产品分组
export function addGroup(data) {
    return request({
        url: '/business/buyCompanyConfig/add',
        method: 'post',
        data:JSON.stringify({
            tableName:"wechat_buy_product_config",
            data:data
        })
    })
}

// 修改产品分组
export function updateGroup(data) {
    return request({
        url: '/business/buyCompanyConfig/edit',
        method: 'post',
        data:JSON.stringify({
            tableName:"wechat_buy_product_config",
            data:data
        })
    })
}

//删除产品分组
export function delGroup(id) {
    return request({
        url: '/business/buyCompanyConfig/delRemove',
        data:JSON.stringify({
            tableName:"wechat_buy_product_config",
            ids:[{id:id}]
        }),
        method: 'post'
    })
}
