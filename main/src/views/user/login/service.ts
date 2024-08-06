import request from '@/utils/request';
import { LoginParamsType } from './data.d';

const API = process.env.VUE_APP_HTTP_PREFIX

export async function accountLogin(params: LoginParamsType): Promise<any> {
  return request({
    url: API + '/login',
    method: 'POST',
    headers: {
      isToken: false,
      repeatSubmit: false,
    },
    data: params,
  });
}
