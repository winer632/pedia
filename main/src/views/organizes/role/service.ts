import request from '@/utils/request'
import { TableListQueryParams } from './data.d'

const API = process.env.VUE_APP_HTTP_PREFIX

export async function queryList(params: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/system/role/list',
    method: 'GET',
    params: {
      ...params,
      pageNum: params.page,
      pageSize: params.perPage
    }
  })
}

export async function queryAll(): Promise<any> {
  return request({
    url: API + '/system/role/all',
    method: 'GET'
  })
}

export async function queryRole(id: number): Promise<any> {
  return request({
    url: API + '/system/role/' + id,
    method: 'GET'
  })
}

export async function add(data: any): Promise<any> {
  return request({
    url: API + '/system/role/add',
    method: 'POST',
    data
  })
}

export async function edit(data: any): Promise<any> {
  return request({
    url: API + '/system/role/edit',
    method: 'PUT',
    data
  })
}

export async function remove(roleIds: string): Promise<any> {
  return request({
    url: API + '/system/role/' + roleIds,
    method: 'DELETE'
  })
}

export async function status(data: any): Promise<any> {
  return request({
    url: API + '/knowledge/status',
    method: 'PUT',
    data
  })
}
