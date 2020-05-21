import { constantRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index'
import { initJsCache } from '@/api/shuxin'
import { globalCache } from '@/api/global-cache'
const permission = {
  state: {
    routes: [],
    addRoutes: []
  },
  mutations: {
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes
      state.routes = constantRoutes.concat(routes)
    }
  },
  actions: {
    // 生成路由
    GenerateRoutes({ commit }) {
      return new Promise(resolve => {
        //向后端请求路由数据
        let p1 = getRouters()
        //向后端请求缓存数据
        let p2 = initJsCache()
      
        Promise.all([p1, p2]).then((result) => {
          console.log('生成路由3:', result)
          //生成路由
          let res1 = result[0];
          const accessedRoutes = filterAsyncRouter(res1.data)
          accessedRoutes.push({
            path: '*',
            redirect: '/404',
            hidden: true
          })
          commit('SET_ROUTES', accessedRoutes)
          resolve(accessedRoutes)
      
          //缓存数据存储
          globalCache.shopCache = result[1].data
          
        }).catch((error) => {
          console.log(error)
        })
      })
    }
  }
}

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap) {
  return asyncRouterMap.filter(route => {
    if (route.component) {
      // Layout组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children)
    }
    return true
  })
}

export const loadView = (view) => { // 路由懒加载
  return () => import(`@/views/${view}`)
}

export default permission
