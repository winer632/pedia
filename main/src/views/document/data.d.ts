export interface DocumentParamsType {
  docId: string;
  name?: string;
  desc?: string;
}

export interface DocumentNormalParamsType {
  id?: number;
  content?: string;
}

export interface DocumentListParamsType {
  id?: number;
  docType?: string; // 文档类型
  docName?: string; // 文档名称
  state?: string; // 文档类型
}

export interface DocumentAddParamsType {
  docId?: string;
  docName?: string;
  files?: any;
  docLang?: string;
  docType?: string;
}

export interface DocumentLLMParamsType {
  docIds: string | number;
  query: string;
  preConversation: string;
  regenerate: {
    isRegenerate: boolean;
  }
  knowledgeScope: {
    basicAbility: number;
    privateDatabase: number;
  }
  config: {
    maxTokens: number;
    temperature: number;
    topP: number;
    stopSequence: string;
    repetitionPenalty: number;
    frequencyPenalty: number;
  }
}

export interface DocumentDeleteParamsType {
  ids: string;
}
