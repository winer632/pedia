import request from '@/utils/request';

const HOST = process.env.VUE_APP_HTTP_PREFIX

export async function queryCurrent(): Promise<any> {
    return request({
        url: HOST + '/getInfo',
        method: 'get'
    });
}

export async function queryMessage(): Promise<any> {
    return request({
        url: '/user/message'
    });
}