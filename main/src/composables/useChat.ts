import { useStore } from "vuex";
import { StateType as QAStateType } from '@/store/qa'

export function useChat(STORE_NAME = 'pk_qa') {
  const store = useStore<{ pk_qa: QAStateType }>();

  const getChatByUuidAndIndex = (uuid: number, index: number) => {
    return store.commit(STORE_NAME + '/getChatByUuidAndIndex', { uuid, index })
  }

  const addChat = (uuid: number, chat: any) => {
    store.commit(STORE_NAME + '/addChatByUuid', { uuid, chat })
  }

  const updateChat = (uuid: number, index: number, chat: any) => {
    store.commit(STORE_NAME + '/updateChatByUuid', { uuid, index, chat })
  }

  const updateChatSome = (uuid: number, index: number, chat: any) => {
    store.commit(STORE_NAME + '/updateChatSomeByUuid', { uuid, index, chat })
  }

  return {
    addChat,
    updateChat,
    updateChatSome,
    getChatByUuidAndIndex,
  }
}
