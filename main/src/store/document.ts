import { Mutation, Action } from 'vuex';
import { StoreModuleType } from "@/utils/store";
import { ResponseData } from '@/utils/request';
import { setToken } from '@/utils/localToken';
import { postDocument } from '../views/document/service';
import { DocumentParamsType, DocumentAddParamsType } from '../views/document/data.d';

export interface StateType extends QAChat.DocumentState {
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
    savePdfUrl: Mutation<StateType>;
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
    changePdfState: Mutation<StateType>;
    changeUrlState: Mutation<StateType>;
    saveUrl: Mutation<StateType>;
  };
  actions: {
    login: Action<StateType, StateType>;
  };
}

const initState: StateType = {
  active: null,
  history: [],
  urlState: {
    openPreview: false,
    url: '',
    urlWithRes: '',
    docId: '',
    status: 1,
  },
  pdfState: {
    openPreview: false,
    pdfUrl: '',
    pdfUrlWithRes: '',
    status: 1,
  },
  loginStatus: undefined,
}

const initUrlState: any = (history) => {
  if (history.conversationType === 'compare') {
    return {
      openPreview: true,
      status: history.docs[0].parserState,
      url: history.docs[0].sourceFile || '',
      docId: history.docs[0].docId || '',
    }
  }
  return {
    openPreview: true,
    status: history.parserState,
    url: history.sourceUrl || '',
    docId: history.docId || '',
  }
}

const initPdfState: any = (history) => {
  return {
    openPreview: true,
    status: history.parserState,
    pdfUrl: history.pdfUrl || ''
  }
}

const StoreModel: ModuleType = {
  namespaced: true,
  name: 'pk_document',
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
      const history = state.history.find(item => item.uuid === null)
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
    changeLoginStatus(state, payload) {
      state.loginStatus = payload;
    },
    updateHistory(state, payload) {
      const { uuid } = payload
      let historyIndex = -1
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
        state.urlState = initUrlState({})
        state.pdfState = initPdfState({})
        state.urlState.openPreview = false
        state.urlState.url = ''
        return
      }

      if (index > 0 && index < state.history.length) {
        const uuid = state.history[index - 1].uuid
        state.active = uuid
        state.urlState = initUrlState(state.history[index - 1])
        state.pdfState = initPdfState(state.history[index - 1])
        return
      }

      if (index === 0) {
        const uuid = state.history[0].uuid
        state.urlState = initUrlState(state.history[0])
        state.pdfState = initPdfState(state.history[0])
        state.active = uuid
      } else if (index >= state.history.length) {
        const uuid = state.history[state.history.length - 1].uuid
        state.active = uuid
        state.urlState = initUrlState(state.history[state.history.length - 1])
        state.pdfState = initPdfState(state.history[state.history.length - 1])
      }
    },
    saveActive(state, payload) {
      const { uuid, status } = payload
      const historyIndex = state.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1) {
        state.active = uuid
        state.urlState = initUrlState(state.history[historyIndex])
        state.pdfState = initPdfState(state.history[historyIndex])
        status && (state.history[historyIndex].parserState = status)
        state.urlState.status = status || state.urlState.status
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
      }
    },
    updateChatByUuid(state, payload) {
      const { uuid } = payload
      const historyIndex = state.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1) {
        state.history[historyIndex].chats[payload.index] = payload.chat
      }
    },
    updateChatSomeByUuid(state, payload) {
      const { uuid, index } = payload
      const historyIndex = state.history.findIndex(item => item.uuid === uuid)
      if (historyIndex !== -1 && index >= 0 && index < state.history[historyIndex].chats.length) {
        const chat = state.history[historyIndex].chats[index]
        state.history[historyIndex].chats[index] = { ...chat, ...payload.chat }
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
    changePdfState(state, payload) {
      state.pdfState = {
        ...state.pdfState,
        ...payload
      }
    },
    changeUrlState(state, payload) {
      state.urlState = {
        ...state.urlState,
        ...payload
      }
    },
    saveUrl(state, payload) {
      state.urlState.urlWithRes = payload.urlWithRes
    },
    savePdfUrl(state, payload) {
      state.pdfState.pdfUrlWithRes = payload.pdfUrlWithRes
    }
  },
  actions: {
    async login({ commit }, payload: FormData) {
      let status: undefined | string = undefined;
      try {
        const response: ResponseData = await postDocument(payload);
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
