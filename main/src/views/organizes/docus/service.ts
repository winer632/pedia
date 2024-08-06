import request from '@/utils/request'
import { TableListQueryParams } from './data.d'

const API = process.env.VUE_APP_HTTP_PREFIX

export async function queryList(data: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/knowledge/document/list',
    method: 'POST',
    data: {
      ...data,
      pageNum: data.page,
      pageSize: data.perPage
    }
  })
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

export async function add(data: FormData): Promise<any> {
  return request({
    url: API + '/knowledge/document/add',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

export async function edit(data: { id: number, docTags: string, docLang: string, docName: string }): Promise<any> {
  return request({
    url: API + '/knowledge/document/edit',
    method: 'POST',
    data
  })
}

export async function remove(data: { ids: string }): Promise<any> {
  return request({
    url: API + '/knowledge/document/remove',
    method: 'DELETE',
    data
  })
}

export async function updateStatus(params: { id: number, status: number }): Promise<any> {
  return request({
    url: API + '/',
    method: 'PUT',
    data: params
  })
}

export async function reParse(params: { docId: string }): Promise<any> {
  return request({
    url: API + '/knowledge/document/reanalyze',
    method: 'GET',
    params
  })
}

export async function publish(params: { ids: string }): Promise<any> {
  return request({
    url: API + '/knowledge/document/listing',
    method: 'GET',
    params
  })
}

export async function stop(params: { ids: string }): Promise<any> {
  return request({
    url: API + '/knowledge/document/delist',
    method: 'GET',
    params
  })
}

export async function association(params: { docId: string }): Promise<any> {
  return request({
    url: API + '/knowledge/count/' + params.docId,
    method: 'GET'
  })
}

export async function verify(data: { id: string, markdownContent: string }): Promise<any> {
  return request({
    url: API + '/knowledge/document/check',
    method: 'POST',
    data
  })
}
