import { Mutation, Action } from 'vuex';
import { StoreModuleType } from "@/utils/store";
import { ResponseData } from '@/utils/request';
import { queryCurrent, queryMessage } from "@/services/user";
import { removeToken } from "@/utils/localToken";
import useQiankunActions from "@/composables/useQiankunActions";

export interface CurrentUser {
  id: number;
  name: string;
  realName: string;
  phone: string;
  email: string;
  createTime?: string;
  avatar: string;
  roleId: number;
  roleName?: string;
  menu?: any[];
  roles: string[];
  token?: string;
  resources?: string[];
  permissions?: string[];
}

export interface StateType {
  currentUser: CurrentUser;
  message: number;
}

export interface ModuleType extends StoreModuleType<StateType> {
  state: StateType;
  mutations: {
    saveCurrentUser: Mutation<StateType>;
    saveMessage: Mutation<StateType>;
    setMenu: Mutation<StateType>;
  };
  actions: {
    fetchCurrent: Action<StateType, StateType>;
    fetchMessage: Action<StateType, StateType>;
    logout: Action<StateType, StateType>;
  };
}

const initState: StateType = {
  currentUser: {
    id: 0,
    name: '',
    realName: '',
    phone: '',
    email: '',
    avatar: '',
    roleId: 0,
    menu: [],
    roles: [],
  },
  message: 0,
}

const StoreModel: ModuleType = {
  namespaced: true,
  name: 'user',
  state: {
    ...initState
  },
  mutations: {
    saveCurrentUser(state, payload) {
      state.currentUser = {
        ...initState.currentUser,
        ...payload,
      }
      /**
      const actions = useQiankunActions();
      actions.setGlobalState({ currentUser: { ...state.currentUser } })
      */
    },
    saveMessage(state, payload) {
      state.message = payload;
    },
    setMenu(state, payload) {
      state.currentUser.menu = payload;
    },
  },
  actions: {
    async fetchCurrent({ commit }) {
      try {
        const response: any = await queryCurrent();
        const data: CurrentUser = {
          name: response.user.loginName,
          realName: response.user.realName,
          phone: response.user.phone,
          email: response.user.email,
          avatar: response.user.avatar,
          createTime: response.user.createTime,
          roleId: ~~response.user.roleId,
          roleName: response.user.roleName,
          roles: response.roles || ['ROLE_DEFAULT'],
          id: response.user.userId,
        };
        data.permissions = response.permissions || []
        data.resources = data.roles || []

        commit('saveCurrentUser', data || {});
        return true;
      } catch (error) {
        return false;
      }
    },
    async fetchMessage({ commit }) {
      try {
        const response: ResponseData = await queryMessage();
        const { data } = response;
        commit('saveMessage', data || 0);
        return true;
      } catch (error) {
        return false;
      }
    },
    async logout({ commit }) {
      try {
        await removeToken();
        commit('saveCurrentUser', { ...initState.currentUser });
        return true;
      } catch (error) {
        return false;
      }
    }
  }
}



export default StoreModel;
