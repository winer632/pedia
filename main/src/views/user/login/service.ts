import request from '@/utils/request';
import { LoginParamsType } from './data.d';

const API = process.env.VUE_APP_HTTP_PREFIX

export async function accountLogin(params: LoginParamsType): Promise<any> {
  const url = API + '/login';
  console.log("URL:", url); // 打印 URL

  return request({
    url: url,
    method: 'POST',
    headers: {
      isToken: false,
      repeatSubmit: false,
    },
    data: params,
  });
}