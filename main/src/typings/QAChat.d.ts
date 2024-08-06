declare namespace QAChat {

  interface Chat {
    id?: number;
    createdAt: string
    text: string
    error?: boolean
    owner: 'me' | 'llm',
    loading?: boolean
    like?: boolean
    unlike?: boolean
    feedback?: string | null
    conversation?: Conversation | null
    prompt?: string
    options?: Conversation | null
  }

  interface History {
    title?: string
    name?: string
    conversationType?: string
    docId?: string
    docIds?: string
    docs?: any[]
    state: number
    parserState?: number
    isEdit: boolean
    uuid: number | undefined | null
    pdfUrl?: string
    createdAt: string
    chats: Chat[]
  }

  interface State {
    active: number | null | undefined
    history: History[]
    chats: Chat[]
  }

  interface DocumentState {
    active: number | null | undefined
    history: History[]
    urlState: {
      openPreview: boolean,
      url: string,
      urlWithRes: string,
      docId: string,
      status: number
    },
    pdfState: {
      openPreview: boolean,
      pdfUrl: string,
      pdfUrlWithRes: string,
      status: number
    }
  }

  interface KnowledgeState {
    active: number | null | undefined
    history: History[]
    chats: Chat[]
    knowledges: Knowledge[]
    urlState: {
      docId: string,
      docName: string,
      chunkId: number,
      openPreview: boolean,
      url: string,
      status: number
    },
    pdfState: {
      docId: string,
      docName: string,
      chunkId: number,
      openPreview: boolean,
      pdfUrl: string,
      status: number
    }
  }

  interface Knowledge {
    knowledgeId: number | string
    knowledgeName: string
    knowledgeStatus: string | null
    knowledgeDocuments: any[]
  }

  interface Conversation {
    conversationId?: string
    parentMessageId?: string
  }

  interface ConversationResponse {
    conversationId: string
    detail: {
      choices: { finish_reason: string; index: number; logprobs: any; text: string }[]
      createdAt: string
      id: string
      model: string
      object: string
      usage: { completion_tokens: number; prompt_tokens: number; total_token: number }
    }
    id: string
    parentMessageId: string
    role: string
    text: string
  }
}
