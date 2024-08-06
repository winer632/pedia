import { Mutation, Action } from 'vuex';
import { StoreModuleType } from "@/utils/store";
import { ResponseData } from '@/utils/request';

import auth from '@/plugins/auth.js'
// import router, { constantRoutes, dynamicRoutes } from '@/config/routes'
// import { getRouters } from '@/services/menu_ry'
// import Layout from '@/layouts/RY/index'
// import ParentView from '@/components/ParentViewRy'
// import InnerLink from '@/layouts/RY/components/InnerLink' RY

// 匹配views里面所有的.vue文件
// const modules = import.meta.glob('./../../views/**/*.vue') RY

export interface StateType {
  routes: Array<any>;
  addRoutes: Array<any>;
  defaultRoutes: Array<any>;
  topbarRoutes: Array<any>;
  sidebarRoutes: Array<any>;
}

export interface ModuleType extends StoreModuleType<StateType> {
  state: StateType;
  mutations: {
  }
  actions: {
  }
}

const initState: StateType = {
  routes: [],
  addRoutes: [],
  defaultRoutes: [],
  topbarRoutes: [],
  sidebarRoutes: [],
}

const StoreModel: ModuleType = {
  namespaced: true,
  name: 'global',
  state: initState,
  mutations: {
    setRoutes(routes) {
      // this.addRoutes = routes
      // this.routes = constantRoutes.concat(routes) RY
    },
    setDefaultRoutes(routes) {
      // this.defaultRoutes = constantRoutes.concat(routes) RY
    },
    setTopbarRoutes(routes) {
      // this.topbarRouters = routes RY
    },
    setSidebarRouters(routes) {
      // this.sidebarRouters = routes RY
    },
    generateRoutes(roles) {
      return new Promise(resolve => {
        // 向后端请求路由数据
        getRouters().then((res: any) => {
          const sdata = JSON.parse(JSON.stringify(res.data))
          // const rdata = JSON.parse(JSON.stringify(res.data))
          // const defaultData = JSON.parse(JSON.stringify(res.data))
          // const sidebarRoutes = filterAsyncRouter(sdata)
          // const rewriteRoutes = filterAsyncRouter(rdata, false, true)
          // const defaultRoutes = filterAsyncRouter(defaultData)
          // const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
          // asyncRoutes.forEach(route => { router.addRoute(route) })
          // this.setRoutes(rewriteRoutes)
          // this.setSidebarRouters(constantRoutes.concat(sidebarRoutes))
          // this.setDefaultRoutes(sidebarRoutes)
          // this.setTopbarRoutes(defaultRoutes)
          // resolve(rewriteRoutes) RY
        })
      })
    }
  },
  actions: {
  }
}

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter(route => {
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === 'Layout') {
        // route.component = Layout RY
      } else if (route.component === 'ParentView') {
        // route.component = ParentView RY
      } else if (route.component === 'InnerLink') {
        // route.component = InnerLink RY
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route['children']
      delete route['redirect']
    }
    return true
  })
}

function filterChildren(childrenMap, lastRouter = false) {
  let children = []
  childrenMap.forEach((el, index) => {
    if (el.children && el.children.length) {
      if (el.component === 'ParentView' && !lastRouter) {
        el.children.forEach(c => {
          c.path = el.path + '/' + c.path
          if (c.children && c.children.length) {
            children = children.concat(filterChildren(c.children, c))
            return
          }
          // children.push(c) RY
        })
        return
      }
    }
    if (lastRouter) {
      // el.path = lastRouter.path + '/' + el.path RY
      if (el.children && el.children.length) {
        children = children.concat(filterChildren(el.children, el))
        return
      }
    }
    children = children.concat(el)
  })
  return children
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes) {
  const res = []
  routes.forEach(route => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        // res.push(route) RY
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        // res.push(route) RY
      }
    }
  })
  return res
}

export const loadView = (view) => {
  let res;
  const modules: any = null
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.vue')[0];
    if (dir === view) {
      res = () => modules[path]();
    }
  }
  return res;
}

export default StoreModel;
function getRouters() {
  return new Promise(resolve => { })
}

