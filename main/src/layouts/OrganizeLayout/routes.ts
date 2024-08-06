import { RoutesDataItem } from "@/utils/routes";
import BlankLayout from '@/layouts/BlankLayout.vue';
import settings from "@/config/settings";

const QiankunLayoutRoutes: Array<RoutesDataItem> = [
  {
    ...settings.homeRouteItem
  },
  {
    icon: 'menu-article',
    title: 'organize-layout.admin.menu.document',
    path: '/organize/document',
    roles: ['admin'],
    component: () => import('@/views/organizes/docus/index.vue'),
  },
  {
    icon: 'menu-article',
    title: 'organize-layout.admin.menu.preview',
    path: '/organize/document/preview/:id',
    roles: ['admin'],
    component: () => import('@/views/organizes/docus/preview.vue'),
  },
  {
    icon: 'menu-article',
    title: 'organize-layout.admin.menu.document',
    path: '/organize/knowledge',
    roles: ['admin'],
    component: () => import('@/views/organizes/knows/index.vue'),
  },
  {
    icon: 'menu-article',
    title: 'organize-layout.admin.menu.knowledgeQA',
    path: '/organize/knowledge/qa',
    roles: ['admin'],
    component: () => import('@/views/knowledge/index.vue'),
  },
  {
    icon: 'menu-article',
    title: 'organize-layout.admin.menu.system',
    path: '/organize/system',
    redirect: '/organize/system/user',
  },
  {
    icon: 'menu-article',
    title: 'organize-layout.admin.menu.system-user',
    path: '/organize/system/user',
    roles: ['admin'],
    component: () => import('@/views/organizes/user/index.vue'),
  },
  {
    icon: 'menu-article',
    title: 'organize-layout.admin.menu.system-role',
    path: '/organize/system/role',
    roles: ['admin'],
    component: () => import('@/views/organizes/role/index.vue'),
  },
  {
    icon: 'menu-article',
    title: 'organize-layout.admin.menu.system-prompt',
    path: '/organize/system/prompt',
    roles: ['admin'],
    component: () => import('@/views/organizes/prompt/index.vue'),
  },
  {
    icon: 'menu-article',
    title: 'organize-layout.admin.menu.system-log',
    path: '/organize/system/log',
    roles: ['admin'],
    component: () => import('@/views/organizes/logs/index.vue'),
  },
  {
    icon: 'menu-article',
    title: 'organize-layout.admin.menu.profile',
    path: '/organize/profile',
    roles: ['admin'],
    component: () => import('@/views/organizes/profile/index.vue'),
  },
  {
    icon: 'menu-article',
    title: 'organize-layout.admin.menu.profile',
    path: '/organize/modify-password',
    roles: ['admin'],
    component: () => import('@/views/organizes/profile/index.vue'),
  },
  {
    icon: 'menu-article',
    title: 'organize-layout.admin.menu.prompt',
    path: '/organize/prompt',
    roles: ['admin'],
    component: () => import('@/views/organizes/prompt/index.vue'),
  },
  {
    icon: 'menu-article',
    title: 'organize-layout.admin.menu.log',
    path: '/organize/log',
    roles: ['admin'],
    component: () => import('@/views/organizes/logs/index.vue'),
  },
  {
    icon: 'menu-article',
    title: 'organize-layout.admin.menu.system-settings',
    path: '/organize/system/settings',
    roles: ['admin'],
    component: () => import('@/views/organizes/settings/index.vue'),
  },
  {
    icon: 'menu-article',
    title: 'organize-layout.admin.menu.system-speech',
    path: '/organize/system/speech',
    roles: ['admin'],
    component: () => import('@/views/organizes/prompt/speech.vue'),
  }
];

export default QiankunLayoutRoutes;
