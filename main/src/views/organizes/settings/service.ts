import request from '@/utils/request'
import { TableListQueryParams } from './data.d'

const API = process.env.VUE_APP_HTTP_PREFIX

export async function queryList(params: TableListQueryParams): Promise<any> {
  return request({
    url: API + '/system/config/list',
    method: 'GET',
    params: {
      ...params,
      pageNum: params.page,
      pageSize: params.perPage
    }
  })
}

export async function add(data: any): Promise<any> {
  return request({
    url: API + '/system/config',
    method: 'POST',
    data
  })
}

export async function edit(data: any): Promise<any> {
  return request({
    url: API + '/system/config',
    method: 'PUT',
    data
  })
}

export async function remove(configId): Promise<any> {
  return request({
    url: API + '/system/config/' + configId,
    method: 'DELETE'
  })
}

export async function query(configId: string): Promise<any> {
  return request({
    url: API + '/system/config/' + configId,
    method: 'GET'
  })
}

export async function queryWithKey(configKey: string): Promise<any> {
  return request({
    url: API + '/system/config/configKey/' + configKey,
    method: 'GET'
  })
}

export async function queryAll(): Promise<any> {
  return request({
    url: API + '/system/config/all',
    method: 'GET'
  })
}

export async function status(data: any): Promise<any> {
  return request({
    url: API + '/system/config/refreshCache',
    method: 'DELETE',
    data
  })
}
