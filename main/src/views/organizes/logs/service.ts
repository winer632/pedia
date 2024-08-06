import request from '@/utils/request'
import { TableListQueryParams } from './data.d'

const API = process.env.VUE_APP_HTTP_PREFIX

export async function queryList(data: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/knowledge/chatlog/list',
    method: 'POST',
    data: {
      ...data,
      pageNum: data.page,
      pageSize: data.perPage
    }
  })
}

export async function queryAll(): Promise<any> {
  return request({
    url: API + '/system/user/all',
    method: 'GET'
  })
}

export async function exportLog(data: { userId: string, from: string, to: string }): Promise<any> {
  return request({
    url: API + '/knowledge/chat/download',
    method: 'POST',
    responseType: 'blob',
    data
  })
}

export async function tree(): Promise<any> {
  return request({
    url: API + '/system/user/tree',
    method: 'GET',
  })
}

export async function add(data: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/knowledge/add',
    method: 'POST',
    data
  })
}

export async function edit(data: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/knowledge/edit',
    method: 'PUT',
    data
  })
}

export async function remove(data: { ids: string }): Promise<any> {
  return request({
    url: API + '/knowledge/remove',
    method: 'DELETE',
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
