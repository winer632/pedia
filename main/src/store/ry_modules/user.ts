import { Mutation, Action } from 'vuex';
import { StoreModuleType } from "@/utils/store";
import { ResponseData } from '@/utils/request';
import { login, logout, getInfo } from '@/services/login_ry';
import { getToken, setToken, removeToken } from '@/utils/auth';
// import defAva from '@/assets/ry/images/profile.jpg'; RY

export interface StateType {
  token: string;
  id: string;
  name: string;
  avatar: string;
  roles: string[];
  permissions: string[];
}

export interface ModuleType {
  namespaced: boolean;
  name: string;
  state: StateType;
  mutations: {
    saveState: Mutation<StateType>;
  };
  actions: {
    login: Action<StateType, ResponseData>;
    getInfo: Action<StateType, ResponseData>;
    logOut: Action<StateType, ResponseData>;
  };
}

const initState: StateType = {
  token: getToken(),
  id: '',
  name: '',
  avatar: '',
  roles: [],
  permissions: []
}

const StoreModel: ModuleType = {
  namespaced: true,
  name: 'ry_user',
  state: {
    ...initState
  },
  mutations: {
    saveState(state: StateType, payload) {
      state = { ...state, ...payload }
    }
  },
  actions: {
    // 登录
    async login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      const res: any = await login(username, password, code, uuid)
      setToken(res.token)
      commit('saveState', { token: res.token })
    },
    // 获取用户信息
    async getInfo({ commit }) {
      const res: any = await getInfo()
      const user = res.user
      const avatar = (user.avatar == "" || user.avatar == null) ? '' : process.env.VUE_APP_VITE_APP_BASE_API + user.avatar;
      let roles: any = []
      let permissions = []
      if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组
        roles = res.roles
        permissions = res.permissions
      } else {
        roles = ['ROLE_DEFAULT']
      }
      const id = user.id
      const name = user.userName
      commit('saveState', { id, name, avatar, roles, permissions })
    },
    // 退出系统
    logOut({ commit }) {
      const res: any = logout()
      removeToken()
      commit('saveState', { token: '', id: '', name: '', avatar: '', roles: [], permissions: [] })
    }
  }
}

export default StoreModel;
