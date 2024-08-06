// import defaultSettings from '@/settings' RY
import { Mutation, Action } from 'vuex';
import { StoreModuleType } from "@/utils/store";
import { useDynamicTitle } from '@/utils/ry_utils/dynamicTitle'
const defaultSettings: any = null
const { sideTheme, showSettings, topNav, tagsView, fixedHeader, sidebarLogo, dynamicTitle } = defaultSettings

export interface StateType {
  title: string;
  theme: string;
  sideTheme: string;
  showSettings: boolean;
  topNav: boolean;
  tagsView: boolean;
  fixedHeader: boolean;
  sidebarLogo: boolean;
  dynamicTitle: boolean;
}

export interface ModuleType extends StoreModuleType<StateType> {
  state: StateType;
  mutations: {
    changeSetting: Mutation<StateType>;
    setTitle: Mutation<StateType>;
  };
  actions: {}
}

export const initState: StateType = {
  title: '',
  theme: sideTheme,
  sideTheme,
  showSettings,
  topNav,
  tagsView,
  fixedHeader,
  sidebarLogo,
  dynamicTitle
}

const StoreModel: ModuleType = {
  namespaced: true,
  name: 'global',
  state: {
    ...initState
  },
  mutations: {
    // 修改布局设置
    changeSetting(state, payload) {
      const { key, value } = payload.data
      // if (state.hasOwnProperty(key)) { RY
      state[key] = value
      // } RY
    },
    // 设置网页标题
    setTitle(state, title) {
      state.title = title
      useDynamicTitle();
    }
  },
  actions: {}
}

export default StoreModel;
