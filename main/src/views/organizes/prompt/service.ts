import request from '@/utils/request'
import { TableListQueryParams } from './data.d'

const API = process.env.VUE_APP_HTTP_PREFIX

export async function queryList(data: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/system/prompt/list',
    method: 'POST',
    data: {
      ...data,
      pageNum: data.page,
      pageSize: data.perPage
    }
  })
}

export async function querySpeechList(data: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/system/speech/list',
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
    url: API + '/system/prompt/get/' + id,
    method: 'GET',
    params: {
      id
    }
  })
}

export async function add(data: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/system/prompt/add',
    method: 'POST',
    data
  })
}

export async function addSpeech(data: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/system/speech/add',
    method: 'POST',
    data
  })
}

export async function edit(data: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/system/prompt/edit',
    method: 'POST',
    data
  })
}

export async function editSpeech(data: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/system/speech/edit',
    method: 'POST',
    data
  })
}

export async function remove(data: { ids: string }): Promise<any> {
  return request({
    url: API + '/system/prompt/remove',
    method: 'POST',
    data
  })
}

export async function removeSpeech(data: { ids: string }): Promise<any> {
  return request({
    url: API + '/system/speech/remove',
    method: 'POST',
    data
  })
}

export async function documents(): Promise<any> {
  return request({
    url: API + '/knowledge/documents',
    method: 'GET'
  })
}

export async function status(): Promise<any> {
  return request({
    url: API + '/knowledge/document/status',
    method: 'GET'
  })
}
