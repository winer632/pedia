import request from '@/utils/request';
import { DocumentParamsType, DocumentNormalParamsType, DocumentAddParamsType, DocumentLLMParamsType, DocumentDeleteParamsType } from './data';

const API = process.env.VUE_APP_HTTP_PREFIX

export async function queryDocument(params: DocumentParamsType): Promise<any> {
  return request({
    url: API + '/system/document/get/' + params.docId,
    method: 'get'
  });
}

export async function postDocument(params: FormData): Promise<any> {
  return request({
    url: API + '/system/document/addFile',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: params
  });
}

export async function updateDocument(params: DocumentAddParamsType): Promise<any> {
  return request({
    url: API + '/system/document/edit',
    method: 'get',
    params
  });
}

export async function deleteDocument(params: DocumentDeleteParamsType): Promise<any> {
  return request({
    url: API + '/system/document/remove',
    method: 'get',
    params
  });
}

export async function getDocumentList(): Promise<any> {
  return request({
    url: API + '/system/document/list',
    method: 'get',
  });
}

export async function getPdfUrl(params: { url: string }): Promise<any> {
  return request({
    url: API + params.url,
    method: 'GET',
    responseType: 'blob'
  })
}

export async function getMdFile(params: { url: string }): Promise<any> {
  return request({
    url: API + params.url,
    method: 'GET'
  })
}

export async function chatLLM(params: DocumentLLMParamsType, signal, onDownloadProgress): Promise<any> {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  }
  return request({
    url: API + '/system/documentchatlog/chat',
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
    url: API + '/system/documentchatlog/list',
    method: 'GET',
    params
  })
}

export async function clearLLM(data: { docId: string }): Promise<any> {
  return request({
    url: API + '/system/documentchatlog/clear',
    method: 'DELETE',
    data
  })
}

export async function stopLLM(params: { stopId: string }): Promise<any> {
  return request({
    url: API + '/system/documentchatlog/stop',
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

export async function addNormalData(params: DocumentNormalParamsType): Promise<any> {
  return request({
    url: API + '/system/phrase',
    method: 'POST',
    data: params
  })
}

export async function updateNormalData(params: DocumentNormalParamsType): Promise<any> {
  return request({
    url: API + '/system/phrase',
    method: 'PUT',
    data: params
  })
}

export async function deleteNormalData(params: DocumentNormalParamsType): Promise<any> {
  return request({
    url: API + '/system/phrase/' + params.id,
    method: 'DELETE'
  })
}

export async function getAbstract(params: { docId: string }): Promise<any> {
  return request({
    url: API + '/system/summary/get',
    method: 'GET',
    params
  })
}

export async function summary(params: { docId: string }): Promise<any> {
  return request({
    url: API + '/system/summary/create',
    method: 'GET',
    params
  })
}

export async function regenerateAbstract(params: { id: any, docId: string }): Promise<any> {
  return request({
    url: API + '/system/summary/reCreate',
    method: 'GET',
    params
  })
}

export async function putLike(data): Promise<any> {
  return request({
    url: API + '/system/documentchatlog/chatFeedback',
    method: 'POST',
    data: data
  })
}

export async function putUnlike(data): Promise<any> {
  return request({
    url: API + '/system/documentchatlog/chatFeedback',
    method: 'POST',
    data: data
  })
}

export async function putFeedback(data): Promise<any> {
  return request({
    url: API + '/system/documentchatlog/chatFeedback',
    method: 'POST',
    data: data
  })
}

export async function putAbstractFeedback(data: { id: string, docId: string, score?: number, comment?: string }): Promise<any> {
  return request({
    url: API + '/system/summary/feedback',
    method: 'POST',
    data
  })
}

export async function addCompare(data): Promise<any> {
  return request({
    url: API + '/system/document-compare/add',
    method: 'POST',
    data
  })
}

export async function postCompare(data): Promise<any> {
  return request({
    url: API + '/system/document-compare/add',
    method: 'POST',
    data
  })
}

export async function updateCompare(data): Promise<any> {
  return request({
    url: API + '/system/document-compare/edit',
    method: 'PUT',
    data
  })
}

export async function deleteCompare(data): Promise<any> {
  return request({
    url: API + '/system/document-compare/remove',
    method: 'DELETE',
    data
  })
}

export async function clearCompareLLM(data): Promise<any> {
  return request({
    url: API + '/system/document-compare/chatlog/clear',
    method: 'DELETE',
    data
  })
}

export async function stopCompareLLM(data): Promise<any> {
  return request({
    url: API + '/system/document-compare/chatlog/stop',
    method: 'GET',
    params: data
  })
}

export async function getCompareLLM(params: any): Promise<any> {
  params.pageSize = params.page
  return request({
    url: API + '/system/document-compare/chatlog/list',
    method: 'GET',
    params
  })
}

export async function chatCompareLLM(data, signal, onDownloadProgress): Promise<any> {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  }
  return request({
    url: API + '/system/document-compare/chatlog/chat',
    method: 'POST',
    data,
    responseType: 'stream',
    signal,
    onDownloadProgress
  });
}

export async function queryCompareList(): Promise<any> {
  return request({
    url: API + '/system/document-compare/list',
    method: 'GET'
  })
}

export async function putCompareFeedback(data: { id: string, docId: string, score?: number, comment?: string }): Promise<any> {
  return request({
    url: API + '/system/document-compare/chatlog/chatFeedback',
    method: 'POST',
    data
  })
}
