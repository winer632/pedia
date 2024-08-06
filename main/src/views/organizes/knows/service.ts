import request from '@/utils/request'
import { TableListQueryParams } from './data.d'

const API = process.env.VUE_APP_HTTP_PREFIX

export async function queryList(data: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/knowledge/list',
    method: 'POST',
    data: {
      ...data,
      pageNum: data.page,
      pageSize: data.perPage
    }
  })
}

export async function query(id: number) {
  return request({
    url: API + '/knowledge/get/' + id,
    method: 'GET',
    params: { id }
  })
}

export async function add(data: TableListQueryParams) {
  return request({
    url: API + '/knowledge/add',
    method: 'POST',
    data
  })
}

export async function edit(data: TableListQueryParams) {
  return request({
    url: API + '/knowledge/edit',
    method: 'POST',
    data
  })
}

export async function remove(data: { ids: string }) {
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
