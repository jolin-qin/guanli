import request from '@/utils/request'
// import * as qpApi from '@/api/shuxin'
// 修改事件
export function updateEvent(data) {
    return request({
        url: '/eventReport/edit',
        method: 'post',
        data:JSON.stringify({
            tableName:"basic_event_type_info",
            data:data
        })
    })
}

//删除事件
export function delEvent(eventCode) {
    return request({
        url: '/eventReport/remove',
        method: 'post',
        data:JSON.stringify({
            tableName: "basic_event_type_info",
            ids:[
              {
                "id": eventCode,
              }
            ]
        })
    })
}

// 导出广告
// export function exportAdvert(query) {
//     return request({
//         url: '/business/advert/export',
//         method: 'get',
//         params: query
//     })
// }
