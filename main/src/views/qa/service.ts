import request from '@/utils/request';
import { QAParamsType, QAListParamsType, QANormalParamsType } from './data.d';

const API = process.env.VUE_APP_HTTP_PREFIX

// 会话接口
export async function postQA(params: QAParamsType): Promise<any> {
  return request({
    url: API + '/system/session/add',
    method: 'POST',
    data: params
  });
}

export async function putQA(params: QAParamsType): Promise<any> {
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

export async function getQA(params: QAParamsType): Promise<any> {
  return request({
    url: API + '/system/session/' + params.id,
    method: 'GET'
  });
}

export async function getQAList(params: { scope: number }): Promise<any> {
  return request({
    url: API + '/system/session/list',
    method: 'GET',
    params
  });
}

export async function chatLLM(params: { sessionId: number, query: string, prompt?: string }, signal, onDownloadProgress) {
  return request({
    url: API + '/system/intellectsessionchatlog/chat',
    method: 'POST',
    data: params,
    responseType: 'stream',
    signal,
    onDownloadProgress
  });
}

export async function getLLM(params: any): Promise<any> {
  params.pageSize = params.page
  return request({
    url: API + '/system/intellectsessionchatlog/list',
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
      scope: 1
    }
  })
}

export async function stopLLM(params: { sessionId: number }): Promise<any> {
  return request({
    url: API + '/system/intellectsessionchatlog/stop',
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

export async function addNormalData(params: QANormalParamsType): Promise<any> {
  return request({
    url: API + '/system/phrase',
    method: 'POST',
    data: params
  })
}

export async function updateNormalData(params: QANormalParamsType): Promise<any> {
  return request({
    url: API + '/system/phrase',
    method: 'PUT',
    data: params
  })
}

export async function deleteNormalData(params: QANormalParamsType): Promise<any> {
  return request({
    url: API + '/system/phrase/' + params.id,
    method: 'DELETE'
  })
}

export async function putLike(data): Promise<any> {
  return request({
    url: API + '/system/intellectsessionchatlog/chatFeedback',
    method: 'POST',
    data: data
  })
}

export async function putUnlike(data): Promise<any> {
  return request({
    url: API + '/system/intellectsessionchatlog/chatFeedback',
    method: 'POST',
    data: data
  })
}

export async function putFeedback(data): Promise<any> {
  return request({
    url: API + '/system/intellectsessionchatlog/chatFeedback',
    method: 'POST',
    data: data
  })
}

export async function putAsText(data): Promise<any> {
  return request({
    data
  })
}

export async function promptList(data: { language: string }): Promise<any> {
  return request({
    url: API + '/system/prompt/list',
    method: 'POST',
    data
  })
}
