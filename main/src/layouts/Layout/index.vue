<script lang="ts" setup>
import { ref, reactive, computed, watch } from "vue"
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { StateType as GlobalStateType } from '@/store/global'
import { RoutesDataItem, BreadcrumbType, PathJsonRoutesDataItem, vueRoutes, jsonPathVueRoutes, getJsonRouteItem, getBreadcrumbRoutes } from '@/utils/routes'
import { StateType as UserStateType } from "@/store/user";
import useTitle from '@/composables/useTitle'
import Permission from '@/components/Permission/index.vue'
import LeftSider from "./components/LeftSider.vue"
import RightTop from './components/RightTop.vue'
import RightFooter from './components/RightFooter.vue'
import LayoutRoutes from './routes'
import Spin from '@/components/Spin/index.vue'


const store = useStore<{ global: GlobalStateType; user: UserStateType }>()
const route = useRoute()
const router = useRouter()


const menu = computed(() => store.state.user.currentUser.menu)

if (router.currentRoute.value.path !== '/' && router.currentRoute.value.path !== '/home') {
  store.commit('global/setMenuEnable', true)
} else {
  store.commit('global/setMenuEnable', false)
}

const showFooter = computed(() => !store.state.global.hideFooter || router.currentRoute.value.path === '/home')

// 模板主题
const theme = computed(() => store.state.global.theme)

// 导航模式
const navMode = computed(() => store.state.global.navMode)

// 框架所有菜单路由
const menuData: RoutesDataItem[] = reactive([{
  path: '/home', title: 'layout.menu.home', redirect: ''
}, {
  path: '/qa', title: 'layout.menu.qa', redirect: ''
}, {
  path: '/document', title: 'layout.menu.document', redirect: ''
}, {
  path: '/knowledge', title: 'layout.menu.knowledge', redirect: ''
}])
// vueRoutes(LayoutRoutes)

// 框架所有的路由转成json并统一添加了parentPath
const jsonPathRoutes: PathJsonRoutesDataItem = jsonPathVueRoutes(menuData)

// 当前路由 item
const routeItem = computed<RoutesDataItem>(() => {
  let jsonRoute: any = getJsonRouteItem(route.path, jsonPathRoutes)
  if (jsonRoute.title === undefined) {
    return { title: '' }
  }

  return jsonRoute
})

// 面包屑导航
const breadCrumbs = reactive<BreadcrumbType[]>([
  {
    path: '/home',
    title: '首页',
  },
  {
    path: '/qa',
    title: '智能问答',
  },
  {
    path: '/document',
    title: '文档问答',
  },
  {
    path: '/knowledge',
    title: '知识库',
  }
]) // computed<BreadcrumbType[]>(() => getBreadcrumbRoutes(route.path, jsonPathRoutes))

// 设置title
useTitle(routeItem);

watch(() => [routeItem.value, menu.value], () => {
  if (menu.value && menu.value.length > 0) {
    if (router.currentRoute.value.path !== '/home') {
      if (menu.value.find(it => it.path === router.currentRoute.value.path) == null) {
        router.push({ path: '/unauthorized' })
        return
      }
    }
    menuData.forEach(item => {
      if (!menu.value.find(it => it.path === item.path)) {
        item.hidden = true
      }
    })
  }
})

//qiankun.js loading
const qiankunStartLoading = computed(() => store.state.global.qiankunStartLoading)
const qiankunViewStyle = computed(() => store.state.global.qiankunViewStyle);
</script>
<template>
  <div v-show="!open" id="layout" :class="{ 'light': theme === 'light' }">
    <left-sider v-if="navMode === 'vertical'" :menu-data="menuData" :route-item="routeItem">
    </left-sider>
    <div id="layout-right" style="background: url('/images/bg.png') 50% / cover no-repeat">
      <right-top :menu-data="menuData" :route-item="routeItem" :bread-crumbs="breadCrumbs">
      </right-top>
      <div id="layout-right-main">
        <permission :roles="routeItem.roles">
          <div v-if="qiankunStartLoading" class="layout-main-conent-loading">
            <spin />
          </div>
          <router-view></router-view>
        </permission>
        <right-footer v-if="showFooter"></right-footer>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
@import './css/index.scss';
</style>
