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

export async function add(data: any): Promise<any> {
  return request({
    url: API + '/knowledge/add',
    method: 'POST',
    data
  })
}

export async function edit(data: any): Promise<any> {
  return request({
    url: API + '/knowledge/edit',
    method: 'PUT',
    data
  })
}

export async function remove(data: any): Promise<any> {
  return request({
    url: API + '/knowledge/remove',
    method: 'DELETE',
    data
  })
}

export async function queryAll(data: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/knowledge/all',
    method: 'POST',
    data: {
      ...data,
      pageNum: data.page,
      pageSize: data.perPage
    }
  })
}

export async function status(data: any): Promise<any> {
  return request({
    url: API + '/knowledge/status',
    method: 'POST',
    data
  })
}
