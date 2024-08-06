import { Mutation, Action } from 'vuex';
import { StoreModuleType } from "@/utils/store";
import { ResponseData } from '@/utils/request';
import { setToken } from '@/utils/localToken';
import { postQA } from '../views/qa/service';
import { replaceDate } from '@/utils/date'

export interface StateType extends QAChat.State {
  loginStatus?: 'ok' | 'error';
}

export interface ModuleType extends StoreModuleType<StateType> {
  state: StateType;
  mutations: {
    getChatByUuid: Mutation<StateType>; // 根据uuid获取消息列表
    addHistory: Mutation<StateType>; // 添加历史记录
    getChatHistoryByCurrentActive: Mutation<StateType>; // 获取当前列表
    loadHistory: Mutation<StateType>; // 加载历史记录
    addChatsByUuid: Mutation<StateType>; // 添加消息列表
    updateChatsByUuid: Mutation<StateType>; // 更新消息列表
    saveHistory: Mutation<StateType>; // 更新到首位
    changeLoginStatus: Mutation<StateType>;
    updateHistory: Mutation<StateType>;
    deleteHistory: Mutation<StateType>;
    saveActive: Mutation<StateType>;
    getChatByUuidAndIndex: Mutation<StateType>;
    addChatByUuid: Mutation<StateType>;
    updateChatByUuid: Mutation<StateType>;
    updateChatSomeByUuid: Mutation<StateType>;
    deleteChatByUuid: Mutation<StateType>;
    clearChatByUuid: Mutation<StateType>;
  };
  actions: {
    login: Action<StateType, StateType>;
  };
}

const initState: StateType = {
  active: null,
  history: [],
  chats: [],
  loginStatus: undefined,
}

const StoreModel: ModuleType = {
  namespaced: true,
  name: 'pk_qa',
  state: {
    ...initState
  },
  mutations: {
    getChatHistoryByCurrentActive(state, payload) {
      const historyIndex = state.history.findIndex(item => item.uuid === state.active)
      if (historyIndex !== -1) {
        return state.history[historyIndex]
      }
      return null
    },
    getChatByUuid(state, payload) {
      const { uuid } = payload
      if (uuid) {
        return state.history.find(item => item.uuid === uuid)?.chats ?? []
      }
      return state.history.find(item => item.uuid === state.active)?.chats ?? []
    },
    addHistory(state, payload: QAChat.History) {
      const historyIndex = state.history.findIndex(item => item.uuid === null)
      if (historyIndex !== -1) {
        return
      }
      const history: QAChat.History = payload
      history.chats = []
      state.history.unshift(history)
      state.active = history.uuid
    },
    loadHistory(state, payload) {
      state.history = payload
    },
    addChatsByUuid(state, payload) {
      const { uuid } = payload
      const historyIndex = state.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1) {
        state.history[historyIndex].chats = payload.data || []
      }
    },
    updateChatsByUuid(state, payload) {
      const { uuid, data } = payload
      const historyIndex = state.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1) {
        state.history[historyIndex].chats.splice(0, 0, ...data)
      }
    },
    saveHistory(state, payload) {
      const { uuid } = payload;
      const historyIndex = state.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1 && historyIndex !== 0) {
        const history = state.history[historyIndex]
        state.history.splice(historyIndex, 1)
        state.history.unshift(history)
      }
    },
    changeLoginStatus(state, payload) {
      state.loginStatus = payload;
    },
    updateHistory(state, payload: Partial<QAChat.History & { type: string, id?: number }>) {
      const { uuid } = payload
      let historyIndex = -1
      let thisIndex = 0
      if (payload.type === 'updateId') {
        historyIndex = state.history.findIndex(item => item.uuid === null)
        thisIndex = state.history.findIndex(item => item.uuid === payload.id)
        if (historyIndex !== -1 && thisIndex === -1) {
          state.history[historyIndex] = { ...state.history[historyIndex], ...{ uuid: payload.id, title: payload.name } }
          state.chats = []
        } else if (thisIndex === -1) {
          state.history.unshift({
            title: payload.name,
            uuid: payload.id,
            isEdit: false,
            createdAt: replaceDate(new Date()),
            state: 1,
            chats: state.chats
          })
          state.chats = []
        }
        return
      }
      if (payload.type === 'update') {
        historyIndex = state.history.findIndex(item => item.uuid === uuid)
      } else {
        historyIndex = state.history.findIndex(item => item.uuid === null)
      }
      if (historyIndex !== -1) {
        state.history[historyIndex] = { ...state.history[historyIndex], ...payload }
      }
    },
    deleteHistory(state, payload) {
      const { uuid } = payload;
      const historyIndex = state.history.findIndex(item => item.uuid === uuid)

      if (historyIndex === -1) {
        return
      }

      state.history.splice(historyIndex, 1)

      const index = historyIndex

      if (state.history.length === 0) {
        state.active = null
        return
      }

      if (index > 0 && index < state.history.length) {
        const uuid = state.history[index - 1].uuid
        state.active = uuid
        return
      }

      if (index === 0) {
        const uuid = state.history[0].uuid
        state.active = uuid
      } else if (index >= state.history.length) {
        const uuid = state.history[state.history.length - 1].uuid
        state.active = uuid
      }
    },
    saveActive(state, payload) {
      const { uuid } = payload
      const historyIndex = state.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1) {
        state.active = uuid
      }
    },
    getChatByUuidAndIndex(state, payload) {
      const { uuid } = payload
      const history = state.history.find(item => item.uuid === uuid)
      if (history) {
        if (0 <= payload.index && payload.index < history.chats.length) {
          return history.chats[payload.index]
        }
      }

      return null
    },
    addChatByUuid(state, payload) {
      const { uuid } = payload
      const historyIndex = state.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1) {
        state.history[historyIndex].chats.push(payload.chat)
      } else {
        state.chats.push(payload.chat)
      }
    },
    updateChatByUuid(state, payload) {
      const { uuid } = payload
      const historyIndex = state.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1) {
        state.history[historyIndex].chats[payload.index] = payload.chat
      }
    },
    updateChatSomeByUuid(state, payload: { uuid: number | null, index: number, chat: Partial<QAChat.Chat> }) {
      const { uuid, index } = payload
      const historyIndex = state.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1 && index >= 0 && index < state.history[historyIndex].chats.length) {
        const chat = state.history[historyIndex].chats[index]
        state.history[historyIndex].chats[index] = { ...chat, ...payload.chat }
      } else if (index >= 0 && index < state.chats.length) {
        state.chats[index] = { ...state.chats[index], ...payload.chat }
      }
    },
    deleteChatByUuid(state, payload: { uuid: number | null, index: number }) {
      const { uuid, index } = payload
      const historyIndex = state.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1 && index >= 0 && index < state.history[historyIndex].chats.length) {
        state.history[historyIndex].chats.splice(index, 1)
      }
    },
    clearChatByUuid(state, payload) {
      const { uuid } = payload
      const historyIndex = state.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1) {
        state.history[historyIndex].chats = []
      }
    },
  },
  actions: {
    async login({ commit }, payload: any) {
      let status: undefined | string = undefined;
      try {
        const response: ResponseData = await postQA(payload);
        const data = response;
        setToken(data.token || '');
        status = 'ok';
      } catch (error: any) {
        if (error.message && error.message === 'CustomError') {
          status = 'error';
        }
      }

      commit('changeLoginStatus', status);

      if (status === 'ok') {
        return true;
      } else if (status === 'error') {
        return false;
      }
      return undefined;
    }
  }
}

export default StoreModel;
