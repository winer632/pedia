import { Mutation, Action } from 'vuex';
import { StoreModuleType } from "@/utils/store";
import { ResponseData } from '@/utils/request';
import { setToken } from '@/utils/localToken';
import { postKnowledge } from '../views/knowledge/service';
import { KnowledgeParamsType } from '../views/knowledge/data.d';
import { replaceDate } from '@/utils/date'

export interface StateType extends QAChat.KnowledgeState {
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
    saveKnowledge: Mutation<StateType>; // 设置知识库
    changePdfState: Mutation<StateType>; // 更新pdf展示状态
    changeUrlState: Mutation<StateType>; // 更新url状态
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
  knowledges: [],
  urlState: {
    docId: '',
    docName: '',
    chunkId: 1,
    openPreview: false,
    url: '',
    status: 1
  },
  pdfState: {
    docId: '',
    docName: '',
    chunkId: 1,
    openPreview: false,
    pdfUrl: '',
    status: 1,
  },
  loginStatus: undefined,
}

const initUrlState: any = (history) => {
  return {
    docId: history.docId,
    docName: history.docName,
    chunkId: 1,
    openPreview: false,
    status: history.state,
    url: history.sourceFile,
  }
}

const initPdfState: any = (history) => {
  return {
    docId: history.docId,
    docName: history.docName,
    chunkId: 1,
    openPreview: false,
    status: history.state,
    pdfUrl: history.pdfUrl || ''
  }
}

const StoreModel: ModuleType = {
  namespaced: true,
  name: 'pk_knowledge',
  state: {
    ...initState
  },
  mutations: {
    getChatHistoryByCurrentActive(state, payload) {
      const history = state.history.find(item => item.uuid === payload.uuid)
      return history
    },
    getChatByUuid(state, payload) {
      const { uuid } = payload
      const history = state.history.find(item => item.uuid === uuid)
      return history?.chats ?? []
    },
    addHistory(state, payload) {
      const history = state.history.find(item => item.uuid === payload.uuid)
      if (history) {
        return
      }
      const historyData: QAChat.History = payload
      historyData.chats = []
      state.history.unshift(historyData)
      state.active = historyData.uuid
      state.urlState = initUrlState(historyData)
      state.pdfState = initPdfState(historyData)
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
      const { uuid } = payload
      const historyIndex = state.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1 && historyIndex !== 0) {
        const history = state.history[historyIndex]
        state.history.splice(historyIndex, 1)
        state.history.unshift(history)
      }
    },
    saveKnowledge(state, payload) {
      state.knowledges = payload
    },
    changePdfState(state, payload) {
      state.pdfState = { ...state.pdfState, ...payload }
    },
    changeUrlState(state, payload) {
      state.urlState = { ...state.urlState, ...payload }
    },
    changeLoginStatus(state, payload) {
      state.loginStatus = payload;
    },
    updateHistory(state, payload: Partial<QAChat.History> & { type: string, id?: number }) {
      const { uuid, type } = payload
      let historyIndex = -1
      let thisIndex = 0
      if (type === 'updateId') {
        historyIndex = state.history.findIndex(item => item.uuid === uuid)
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
      if (type === 'add') {
        historyIndex = state.history.findIndex(item => item.uuid === null)
      } else {
        historyIndex = state.history.findIndex(item => item.uuid === uuid)
      }
      if (historyIndex !== -1) {
        state.history[historyIndex] = { ...state.history[historyIndex], ...payload }
      }
    },
    deleteHistory(state, payload) {
      const { uuid } = payload
      const historyIndex = state.history.findIndex(item => item.uuid === uuid)

      if (historyIndex === -1) {
        return
      }

      state.history.splice(historyIndex, 1)

      const index = historyIndex

      if (state.history.length === 0) {
        state.active = null
        state.urlState = initUrlState({})
        state.pdfState = initPdfState({})
        state.urlState.url = ''
        state.urlState.openPreview = false
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
      const { uuid, chat } = payload
      const historyIndex = state.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1) {
        state.history[historyIndex].chats[payload.index] = chat
      }
    },
    updateChatSomeByUuid(state, payload) {
      const { uuid, index, chat } = payload
      const historyIndex = state.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1 && index >= 0 && index < state.history[historyIndex].chats.length) {
        const chats = state.history[historyIndex].chats[index]
        state.history[historyIndex].chats[index] = { ...chats, ...chat }
      } else if (index >= 0 && index < state.chats.length) {
        state.chats[index] = { ...state.chats[index], ...payload.chat }
      }
    },
    deleteChatByUuid(state, payload) {
      const { uuid } = payload
      const historyIndex = state.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1) {
        state.history[historyIndex].chats.splice(payload.index, 1)
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
    async login({ commit }, payload: KnowledgeParamsType) {
      let status: undefined | string = undefined;
      try {
        const response: ResponseData = await postKnowledge(payload);
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
