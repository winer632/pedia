import request from '@/utils/request'
import { TableListQueryParams } from './data'

const API = process.env.VUE_APP_HTTP_PREFIX

export async function queryList(params: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/knowledge/list',
    method: 'POST',
    data: {
      ...params,
      pageNum: params.page,
      pageSize: params.perPage
    }
  })
}

export async function remove(params: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/knowledge/delete',
    method: 'POST',
    data: {
      ...params,
      pageNum: params.page,
      pageSize: params.perPage
    }
  })
}

export async function query(id: number): Promise<any> {
  return request({
    url: API + '/knowledge/get/' + id,
    method: 'GET',
    params: {
      id
    }
  })
}

export async function update(data: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/system/user',
    method: 'PUT',
    data
  })
}

export async function create(params: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/knowledge/create',
    method: 'POST',
    data: {
      ...params,
      pageNum: params.page,
      pageSize: params.perPage
    }
  })
}

export async function resetPwd(data: { oldPassword: string, password: string }): Promise<any> {
  return request({
    url: API + '/system/user/resetPwd',
    method: 'PUT',
    data
  })
}
export async function avatar(data: FormData): Promise<any> {
  return request({
    url: API + '/system/user/avatar',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data
  })
}

export async function status(params: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/knowledge/status',
    method: 'POST',
    data: {
      ...params,
      pageNum: params.page,
      pageSize: params.perPage
    }
  })
}
