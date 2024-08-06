import request from '@/utils/request'
import { TableListQueryParams, TableListItem } from './data.d'

const API = process.env.VUE_APP_HTTP_PREFIX

export async function queryList(params: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/system/user/list',
    method: 'GET',
    params: {
      ...params,
      pageNum: params.page,
      pageSize: params.perPage
    }
  })
}

export async function query(userId: number): Promise<any> {
  return request({
    url: API + '/system/user/' + userId,
    method: 'GET'
  })
}

export async function add(data: TableListItem): Promise<any> {
  return request({
    url: API + '/system/user/add',
    method: 'POST',
    data
  })
}

export async function edit(data: TableListItem): Promise<any> {
  return request({
    url: API + '/system/user',
    method: 'PUT',
    data
  })
}

export async function remove(userIds: string): Promise<any> {
  return request({
    url: API + '/system/user/' + userIds,
    method: 'DELETE'
  })
}

export async function status(data: { status: string }): Promise<any> {
  return request({
    url: API + '/system/user/changeStatus',
    method: 'PUT',
    data
  })
}

export async function resetP(data: { oldPassword: string, password: string }): Promise<any> {
  return request({
    url: API + '/system/user/resetPwd',
    method: 'PUT',
    data
  })
}
