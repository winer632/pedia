import Cookies from 'js-cookie';
import { Mutation } from 'vuex';
import { StoreModuleType } from "@/utils/store";

export interface StateType {
  sidebar: {
    opened: boolean;
    withoutAnimation: boolean;
    hide: boolean;
  };
  device: string;
  size: string;
}

export interface ModuleType extends StoreModuleType<StateType> {
  state: StateType;
  mutations: {
    toggleSideBar: Mutation<StateType>;
    closeSideBar: Mutation<StateType>;
    toggleDevice: Mutation<StateType>;
    setSize: Mutation<StateType>;
    toggleSideBarHide: Mutation<StateType>;
  };
  actions: {}
}

const initState: StateType = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false,
    hide: false
  },
  device: 'desktop',
  size: Cookies.get('size') || 'default'
}

const StoreModel: ModuleType = {
  namespaced: true,
  name: 'ry_app',
  state: {
    ...initState
  },
  mutations: {
    toggleSideBar(state, payload) {
      if (state.sidebar.hide) {
        return false;
      }
      state.sidebar.opened = !state.sidebar.opened
      state.sidebar.withoutAnimation = payload.withoutAnimation
      if (state.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
    },
    closeSideBar(state, payload) {
      Cookies.set('sidebarStatus', 0)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = payload.withoutAnimation
    },
    toggleDevice(state, payload) {
      state.device = payload.device
    },
    setSize(state, payload) {
      state.size = payload.size;
      Cookies.set('size', payload.size)
    },
    toggleSideBarHide(state, { status }) {
      state.sidebar.hide = status
    }

  },
  actions: {

  }
}

export default StoreModel;
