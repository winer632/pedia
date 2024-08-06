
import { Mutation/* , Action */ } from 'vuex';
import { StoreModuleType } from "@/utils/store";
import { TabNavItem, equalTabNavRoute } from '@/utils/routes';
import settings, { Theme, NavMode } from '@/config/settings';
import router from '@/config/routes';

export type QiankunViewStyle = '' | 'screen' | 'none';

export interface StateType {
  // 左侧固定
  fixed: boolean;
  // 开启左侧
  lefter: boolean;
  // hideFooter
  hideFooter: boolean;
  // 多选支持
  multipleOption: boolean;
  // 最大Token
  maxToken: number;
  // 是否打开对比
  openDocumentCompare: boolean;
  // 左侧展开收起
  collapsed: boolean;
  // 模板主题
  theme: Theme;
  // 头部固定开启
  navMode: NavMode;
  // 头部固定开启
  headFixed: boolean;
  // tab菜单开启
  tabNavEnable: boolean;
  // 头部tab导航列表
  headTabNavList: TabNavItem[];
  // 左侧侧边固定开启
  leftSiderFixed: boolean;
  //
  menuEnable: boolean;
  // qiankun.js startLoading
  qiankunStartLoading: boolean;
  // qiankun.js ViewStyle
  qiankunViewStyle: QiankunViewStyle;
}

export interface ModuleType extends StoreModuleType<StateType> {
  state: StateType;
  mutations: {
    changeLayoutCollapsed: Mutation<StateType>;
    setTheme: Mutation<StateType>;
    setNavMode: Mutation<StateType>;
    setHeadFixed: Mutation<StateType>;
    setTabNavEnable: Mutation<StateType>;
    setHeadTabNavList: Mutation<StateType>;
    closeCurrentHeadTabNav: Mutation<StateType>;
    setLeftSiderFixed: Mutation<StateType>;
    setMenuEnable: Mutation<StateType>;
    setQiankunStartLoading: Mutation<StateType>;
    setQiankunViewStyle: Mutation<StateType>;
    setLefter: Mutation<StateType>;
    setFixed: Mutation<StateType>;
    setMultipleOption: Mutation<StateType>;
    setMaxToken: Mutation<StateType>;
    setOpenDocumentCompare: Mutation<StateType>;
  };
  actions: {
  };
}

const homeRoute = router.resolve(settings.homeRouteItem.path);
const initState: StateType = {
  fixed: settings.fixed,
  lefter: settings.lefter,
  hideFooter: settings.hideFooter,
  multipleOption: settings.multipleOption,
  maxToken: settings.maxToken,
  openDocumentCompare: settings.openDocumentCompare,
  collapsed: false,
  theme: settings.theme,
  navMode: settings.navMode,
  headFixed: settings.headFixed,
  tabNavEnable: settings.tabNavEnable,
  headTabNavList: [
    {
      route: homeRoute,
      menu: settings.homeRouteItem
    }
  ],
  leftSiderFixed: settings.leftSiderFixed,
  menuEnable: settings.menuEnable,
  qiankunStartLoading: false,
  qiankunViewStyle: 'none',
};

const StoreModel: ModuleType = {
  namespaced: true,
  name: 'global',
  state: {
    ...initState
  },
  mutations: {
    changeLayoutCollapsed(state, payload) {
      state.collapsed = payload;
    },
    setTheme(state, payload) {
      state.theme = payload;
    },
    setNavMode(state, payload) {
      state.navMode = payload;
    },
    setHeadFixed(state, payload) {
      state.headFixed = payload;
    },
    setTabNavEnable(state, payload) {
      state.tabNavEnable = payload;
    },
    setHeadTabNavList(state, payload) {
      state.headTabNavList = payload;
    },
    /**
     * 关闭当前tabNav，并调转自定义路由
     * @param state
     * @param payload Function 回调
     */
    closeCurrentHeadTabNav(state, payload: Function) {
      const navList: TabNavItem[] = state.headTabNavList.filter((item2: TabNavItem) => !equalTabNavRoute(router.currentRoute.value, item2.route, item2.menu.tabNavType))
      state.headTabNavList = [
        ...navList
      ]
      if (typeof payload === 'function') {
        payload()
      }
    },
    setLeftSiderFixed(state, payload) {
      state.leftSiderFixed = payload;
    },
    setMenuEnable(state, payload) {
      console.error(state, payload)
      state.menuEnable = payload;
    },
    setQiankunStartLoading(state, payload) {
      state.qiankunStartLoading = payload;
    },
    setQiankunViewStyle(state, payload: QiankunViewStyle) {
      state.qiankunViewStyle = payload;
    },
    setLefter(state, payload) {
      state.lefter = payload;
    },
    setFixed(state, payload) {
      state.fixed = payload;
    },
    setMultipleOption(state, payload) {
      state.multipleOption = payload;
    },
    setMaxToken(state, payload) {
      state.maxToken = payload;
    },
    setOpenDocumentCompare(state, payload) {
      state.openDocumentCompare = payload;
    }
  },
  actions: {}
}



export default StoreModel;
