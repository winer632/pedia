// import defaultSettings from './settings' RY
import { useStore } from "vuex";

/**
 * 动态修改标题
 */
export function useDynamicTitle() {
  const store = useStore<any>();
  const settingsStore = store.state.ry_settings;
  if (settingsStore.dynamicTitle) {
    // document.title = settingsStore.title + ' - ' + defaultSettings.title; RY
  } else {
    // document.title = defaultSettings.title; RY
  }
}
