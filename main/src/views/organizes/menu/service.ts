import request from '@/utils/request'
import { TableListQueryParams } from './data.d'

const API = process.env.VUE_APP_HTTP_PREFIX

export async function queryList(data: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/system/menu/list',
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
    url: API + '/system/menu/add',
    method: 'POST',
    data
  })
}

export async function edit(data: any): Promise<any> {
  return request({
    url: API + '/system/menu/edit',
    method: 'PUT',
    data
  })
}

export async function remove(data: any): Promise<any> {
  return request({
    url: API + '/system/menu',
    method: 'DELETE',
    data
  })
}

export async function queryRole(roleId: number): Promise<any> {
  return request({
    url: API + '/system/menu/' + roleId,
    method: 'GET'
  })
}

export async function queryTree(): Promise<any> {
  return request({
    url: API + '/system/menu/tree',
    method: 'GET'
  })
}
