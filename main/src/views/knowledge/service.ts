import request from '@/utils/request';
import { KnowledgeParamsType } from './data.d';

const API = process.env.VUE_APP_HTTP_PREFIX

export async function queryKnowledge(params: KnowledgeParamsType): Promise<any> {
  return request({
    url: API + '/knowledge/info/' + params.id,
    method: 'get'
  });
}

export async function postKnowledge(params: KnowledgeParamsType): Promise<any> {
  return request({
    url: API + '/knowledge',
    method: 'post',
    data: params
  });
}

export async function putKnowledge(params: KnowledgeParamsType): Promise<any> {
  return request({
    url: API + '/knowledge/' + params.id,
    method: 'put',
    data: params
  });
}

export async function deleteKnowledge(params: KnowledgeParamsType): Promise<any> {
  return request({
    url: API + '/knowledge/' + params.id,
    method: 'delete'
  });
}

export async function getKnowledgeList(params: KnowledgeParamsType): Promise<any> {
  return request({
    url: API + '/knowledge/list',
    method: 'get',
    params
  });
}

export async function queryAll(): Promise<any> {
  return request({
    url: API + '/knowledge/all',
    method: 'POST'
  })
}

export async function postQA(params: KnowledgeParamsType): Promise<any> {
  return request({
    url: API + '/system/session/add/',
    method: 'POST',
    data: params
  });
}

export async function putQA(params: KnowledgeParamsType): Promise<any> {
  return request({
    url: API + '/system/session/edit',
    method: 'PUT',
    data: params
  });
}

export async function deleteQA(data: { ids: string, scope: number }): Promise<any> {
  return request({
    url: API + '/system/session/remove',
    method: 'DELETE',
    data
  });
}

export async function getQAList(params: { scope: number }): Promise<any> {
  return request({
    url: API + '/system/session/list',
    method: 'GET',
    params
  });
}

export async function queryDocument(docId): Promise<any> {
  return request({
    url: API + '/knowledge/document/info/' + docId,
    method: 'get'
  });
}

export async function query(id: number): Promise<any> {
  return request({
    url: API + '/knowledge/document/get/' + id,
    method: 'GET',
    params: {
      id
    }
  })
}

export async function chatLLM(params: KnowledgeParamsType, signal, onDownloadProgress): Promise<any> {
  return request({
    url: API + '/knowledge/chat',
    method: 'POST',
    data: params,
    responseType: 'stream',
    signal,
    onDownloadProgress
  })
}

export async function getLLM(params: KnowledgeParamsType): Promise<any> {
  params.pageSize = params.page
  return request({
    url: API + '/knowledge/chat/list',
    method: 'GET',
    params
  })
}

export async function clearLLM(data: { id: number }): Promise<any> {
  return request({
    url: API + '/system/session/clear',
    method: 'DELETE',
    data: {
      ...data,
      scope: 2
    }
  })
}

export async function stopLLM(params: KnowledgeParamsType): Promise<any> {
  return request({
    url: API + '/knowledge/chat/stop',
    method: 'GET',
    params
  })
}

export async function getNormalData(): Promise<any> {
  return request({
    url: API + '/system/phrase/list',
    method: 'GET',
  })
}

export async function addNormalData(params: KnowledgeParamsType): Promise<any> {
  return request({
    url: API + '/system/phrase',
    method: 'POST',
    data: params
  })
}

export async function updateNormalData(params: KnowledgeParamsType): Promise<any> {
  return request({
    url: API + '/system/phrase',
    method: 'PUT',
    data: params
  })
}

export async function deleteNormalData(params: KnowledgeParamsType): Promise<any> {
  return request({
    url: API + '/system/phrase/' + params.id,
    method: 'DELETE'
  })
}

export async function putLike(data): Promise<any> {
  return request({
    url: API + '/knowledge/chat/feedback',
    method: 'POST',
    data
  })
}

export async function putUnlike(data): Promise<any> {
  return request({
    url: API + '/knowledge/chat/feedback',
    method: 'POST',
    data
  })
}

export async function putFeedback(data): Promise<any> {
  return request({
    url: API + '/knowledge/chat/feedback',
    method: 'POST',
    data
  })
}

export async function getPdfUrl(params: { url: string }): Promise<any> {
  return request({
    url: API + params.url,
    method: 'GET',
    responseType: 'blob'
  })
}

export async function langby(): Promise<any> {
  return request({
    url: API + '/system/language/list',
    method: 'GET',
  })
}

export async function putAsText(data): Promise<any> {
  return request({
    data
  })
}
