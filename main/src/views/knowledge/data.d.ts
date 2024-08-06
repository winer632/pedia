export interface KnowledgeParamsType {
  id: number;
  name?: string;
  desc?: string;
  page?: nuumber;
  pageSize?: number;
}

export interface KnowledgeNormalParamsType {
  id?: number;
  content?: string;
}

export interface KnowledgeListParamsType {
  id?: number;
  docType?: string;
  docName?: string;
  state?: string;
}

export interface KnowledgeAddParamsType {
  docId?: string;
  docName?: string;
  files?: any;
  docLang?: string;
  docType?: string;
}

export interface KnowledgeLLMParamsType {
  docIds: string | number;
  query: string;
  preConversation: string;
  regenerate: {
    isRegenerate: boolean;
  }
  knowledgeScope: {
    basicAbility: number;
    advancedAbility: number;
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
