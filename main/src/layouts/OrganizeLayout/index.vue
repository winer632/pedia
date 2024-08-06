<script lang="ts" setup>
import { reactive, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { StateType as GlobalStateType } from '@/store/global';
import { StateType as UserStateType, CurrentUser } from "@/store/user";
import {
  RoutesDataItem,
  BreadcrumbType,
  PathJsonRoutesDataItem,
  vueRoutes,
  jsonPathVueRoutes,
  getJsonRouteItem,
  getJsonRouteItems,
  getBreadcrumbRoutes,
} from '@/utils/routes';
import useTitle from '@/composables/useTitle';
import Permission from '@/components/Permission/index.vue';
import LeftSider from './components/LeftSider.vue';
import RightTop from './components/RightTop.vue';
import RightFooter from './components/RightFooter.vue';
import LayoutRoutes from './routes';
import Spin from '@/components/Spin/index.vue';
import Left from './components/Left.vue';

const store = useStore<{ global: GlobalStateType, user: UserStateType }>();
const route = useRoute();
const router = useRouter();

const menu = computed(() => store.state.user.currentUser.menu)

if (
  router.currentRoute.value.path !== '/' &&
  router.currentRoute.value.path !== '/home'
) {
  store.commit('global/setMenuEnable', true);
} else {
  store.commit('global/setMenuEnable', false);
}

const showFooter = computed(() => !store.state.global.hideFooter);

// 模板主题
const theme = computed(() => store.state.global.theme);

// 导航模式
const navMode = computed(() => store.state.global.navMode);

// 框架所有菜单路由
const menuData: RoutesDataItem[] = reactive([
  {
    path: '/organize/document',
    title: 'organize-layout.admin.menu.document',
    redirect: '',
  },
  {
    path: '/organize/knowledge',
    title: 'organize-layout.admin.menu.knowledge',
    redirect: '',
  },
  {
    path: '/organize/knowledge/qa',
    title: 'organize-layout.admin.menu.knowledgeQA',
    redirect: '',
  },
  {
    path: '/organize/system',
    title: 'organize-layout.admin.menu.system',
    redirect: '',
  },
  {
    path: '/organize/profile',
    title: 'organize-layout.admin.menu.profile',
    redirect: '',
    hidden: true,
  },
  {
    path: '/organize/log',
    title: 'organize-layout.admin.menu.log',
    redirect: '',
  },
  {
    path: '/organize/prompt',
    title: 'organize-layout.admin.menu.prompt',
    redirect: '/organize/system',
    parentR: '/organize/system',
    hidden: true,
  },
  {
    path: '/organize/modify-password',
    title: 'organize-layout.admin.menu.profile',
    redirect: '',
    parentR: '/organize/profile',
    hidden: true,
  },
  {
    path: '/organize/system/role',
    title: 'organize-layout.admin.menu.role',
    parentR: '/organize/system',
    hidden: true,
  },
  {
    path: '/organize/system/settings',
    title: 'organize-layout.admin.menu.settings',
    parentR: '/organize/system',
    hidden: true,
  },
  {
    path: '/organize/system/speech',
    title: 'organize-layout.admin.menu.system-speech',
    parentR: '/organize/system',
    hidden: true,
  },
  {
    path: '/organize/system/user',
    title: 'organize-layout.admin.menu.system-user',
    parentR: '/organize/system',
    hidden: true,
  }

]);
// vueRoutes(LayoutRoutes)

// 框架所有的路由转成json并统一添加了parentPath
const jsonPathRoutes: PathJsonRoutesDataItem = jsonPathVueRoutes(menuData);

// 当前路由 item
const routeItem = computed<RoutesDataItem>(() => {
  let jsonRoute: any = getJsonRouteItems(route.path, jsonPathRoutes)
  if (jsonRoute.pItem.title === undefined) {
    jsonRoute.pItem = { title: '' }
  }
  if (jsonRoute.item.title === undefined) {
    jsonRoute.item = { title: '' }
  }

  return jsonRoute
});

// 面包屑导航
const breadCrumbs = reactive<BreadcrumbType[]>([
  {
    path: '/organize/document',
    title: '文档管理',
  },
  {
    path: '/organize/knowledge',
    title: '知识库管理',
  },
  {
    path: '/document',
    title: '文档问答',
  },
  {
    path: '/knowledge',
    title: '系统管理',
  },
]); // computed<BreadcrumbType[]>(() => getBreadcrumbRoutes(route.path, jsonPathRoutes))

// 设置title
useTitle({ value: routeItem.value.item });

const leftMenu = reactive([{
  path: '/organize/system/user',
  title: 'organize-layout.admin.menu.system-user',
  redirect: '',
  icon: 'pk-menuuser',
}, {
  path: '/organize/system/role',
  title: 'organize-layout.admin.menu.system-role',
  redirect: '',
  icon: 'pk-menurole',
}, {
  path: '/organize/system/settings',
  title: 'organize-layout.admin.menu.system-settings',
  redirect: '',
  icon: 'pk-menusetting',
}, {
  path: '/organize/system/speech',
  title: 'organize-layout.admin.menu.system-speech',
  redirect: '',
  icon: 'pk-menusetting',
}, {
  path: '/organize/prompt',
  title: 'organize-layout.admin.menu.prompt',
  redirect: '',
  icon: 'pk-menusetting',
}])
const reflectMenu = () => {
  if (menu.value && menu.value.length > 0) {
    menuData.forEach(item => {
      if (profilePath.includes(routeItem.value.item.path)) {
        item.hidden = false
        if (item.parentR) {
          item.hidden = true
        }
        if (!profilePath.includes(item.path)) {
          item.hidden = true
        }
      } else {
        item.hidden = false
        if (item.parentR) {
          item.hidden = true
        }
        if (profilePath.includes(item.path)) {
          item.hidden = true
        }
        const find = menu.value.find(it => it.path === item.path)
        if (!find) {
          item.hidden = true
        }
      }
    })
  }
  if (menu.value && menu.value.length > 0) {
    leftMenu.forEach(item => {
      const find = menu.value.find(it => it.path === item.path)
      if (!find) {
        item.hidden = true
      }
    })
  }
}
const profilePath = ['/organize/profile', '/organize/modify-password']
onMounted(() => {
  reflectMenu()
})
watch(() => [routeItem.value.item, menu.value], () => {
  if (menu.value?.length > 0 && menu.value.find(it => it.path === router.currentRoute.value.path) == null) {
    if (router.currentRoute.value.path.includes('/organize/document/preview') === false) {
      return router.push({ path: '/unauthorized' })
    }
  }
  reflectMenu()
})

watch(() => routeItem.value.item, () => {
  const f = leftMenu.find(item => item.path === routeItem.value.item.path)
  if (f) {
    for (const i in leftMenu) {
      if (leftMenu[i].path === routeItem.value.item.path) {
        leftMenu[i].icon = leftMenu[i].icon.replace('Active', '') + 'Active'
      } else {
        leftMenu[i].icon = leftMenu[i].icon.replace('Active', '')
      }
    }
  }
})
const lefter = computed(() => store.state.global.lefter);

//qiankun.js loading
const qiankunStartLoading = computed(() => store.state.global.qiankunStartLoading);
const qiankunViewStyle = computed(() => store.state.global.qiankunViewStyle);
</script>
<template>
  <div id="layout" :class="{ light: theme === 'light' }">
    <left-sider v-if="navMode === 'vertical'" :menu-data="menuData" :route-item="routeItem">
    </left-sider>
    <div id="layout-right" style="background: url('/images/bg.png') 50% / cover no-repeat">
      <right-top :menu-data="menuData" :route-item="routeItem.pItem" :bread-crumbs="breadCrumbs">
      </right-top>
      <div id="layout-main">
        <left v-if="lefter" :menu-data="leftMenu" :route-item="routeItem.item">
        </left>
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
  </div>
</template>
<style lang="scss">
@import './css/index.scss';
@import './css/left-layout.scss';
</style>
