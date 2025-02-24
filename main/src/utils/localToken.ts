/**
 * 自定义 token 操作
 * @author QuerySystem
 */
import localforage from 'localforage';
import settings from '@/config/settings';

/**
 * 获取本地Token
 */
export const getToken = async (): Promise<string | null> => {
  return await localforage.getItem(settings.siteTokenKey);
};

/**
 * 设置存储本地Token
 */
export const setToken = async (token: string): Promise<boolean> => {
  try {
    await localforage.setItem(settings.siteTokenKey, token);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 移除本地Token
 */
export const removeToken = async (): Promise<boolean> => {
  try {
    await localforage.removeItem(settings.siteTokenKey);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 根据key获取token
 */
export const getTokenWithKey = async (key: string): Promise<string | null> => {
  return await localforage.getItem(key);
}

/**
 * 根据key, value设置token
 */
export const setTokenWithKey = async (key: string, value: string): Promise<boolean> => {
  try {
    await localforage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 根据key删除Token
 */
export const removeTokenWithKey = async (key: string): Promise<boolean> => {
  try {
    await localforage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
}
