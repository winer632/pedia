/**
 * 路由入口
 * @author QuerySystem
 */
import NProgress from 'nprogress'; // progress bar
import 'nprogress/nprogress.css'; // progress bar style
NProgress.configure({ showSpinner: false, easing: 'ease', speed: 1000 }); // NProgress Configuration

import { createRouter, createWebHistory } from 'vue-router';
import { RoutesDataItem } from "@/utils/routes";
import settings from "@/config/settings";

import SecurityLayout from '@/layouts/SecurityLayout.vue';

import LayoutRoutes from "@/layouts/Layout/routes";
import Layout from "@/layouts/Layout/index.vue";

import OrganizeLayoutRoutes from "@/layouts/OrganizeLayout/routes";
import OrganizeLayout from "@/layouts/OrganizeLayout/index.vue";

import UserLayoutRoutes from '@/layouts/UserLayout/routes';
import UserLayout from '@/layouts/UserLayout/index.vue';

const WebRoutes: Array<RoutesDataItem> = [
  {
    title: 'layout.menu.qa',
    path: '/qa',
    component: () => import('@/views/qa/index.vue')
  },
  {
    title: 'layout.menu.document',
    path: '/document',
    component: () => import('@/views/document/index.vue')
  },
  {
    title: 'layout.menu.knowledge',
    path: '/knowledge',
    component: () => import('@/views/knowledge/index.vue')
  }
]

const routes: Array<RoutesDataItem> = [
  {
    title: 'empty',
    path: '/',
    component: SecurityLayout,
    children: [
      {
        title: 'empty',
        path: '/',
        redirect: settings.homeRouteItem.path,
        component: Layout,
        children: [
          ...WebRoutes,
          ...LayoutRoutes
        ]
      },
      {
        title: 'empty',
        path: '/',
        component: OrganizeLayout,
        children: [
          ...OrganizeLayoutRoutes
        ]
      },
      {
        title: 'empty',
        path: '/refresh',
        component: () => import('@/views/refresh/index.vue')
      },
    ]
  },
  {
    title: 'empty',
    path: '/login',
    redirect: '/user/login'
  },
  {
    title: 'empty',
    path: '/register',
    redirect: '/user/register'
  },
  {
    title: 'empty',
    path: '/user',
    redirect: '/user/login',
    component: UserLayout,
    children: UserLayoutRoutes
  },
  {
    title: 'empty',
    path: '/unauthorized',
    component: () => import('@/views/403/403.vue')
  },
  {
    title: 'app.global.menu.notfound',
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/404/index.vue'),
  }
]

const router = createRouter({
  scrollBehavior(/* to, from, savedPosition */) {
    return { top: 0 }
  },
  history: createWebHistory(process.env.MICRO_PUBLIC_PATH),
  routes: routes,
});

router.beforeEach((to, from, next) => {
  // 此判断[if(to.fullPath!==from.fullPath)]为了防止子应用也是vue-router4导致主应用与子应用路由来回跳转执行
  if (to.fullPath !== from.fullPath) {
    // start progress bar
    NProgress.start();
    next()
  }
});

router.afterEach(() => {
  // finish progress bar
  NProgress.done();
});

export default router;
