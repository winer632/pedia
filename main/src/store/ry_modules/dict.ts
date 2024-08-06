import { Mutation, Action } from 'vuex';
import { StoreModuleType } from "@/utils/store";

export interface StateType {
  dict: Array<any>;
}

export interface ModuleType extends StoreModuleType<StateType> {
  state: StateType;
  mutations: {
    setDict: Mutation<StateType>;
    getDict: Mutation<StateType>;
    removeDict: Mutation<StateType>;
    cleanDict: Mutation<StateType>;
    initDict: Mutation<StateType>;
  };
  actions: {}
}

const initState: StateType = {
  dict: []
}

const StoreModel: ModuleType = {
  namespaced: true,
  name: 'sy_dict',
  state: {
    ...initState
  },
  mutations: {
    // 获取字典
    getDict(state, payload) {
      if (payload._key == null && payload._key == "") {
        return null;
      }
      try {
        for (let i = 0; i < state.dict.length; i++) {
          if (state.dict[i].key == payload._key) {
            return state.dict[i].value;
          }
        }
      } catch (e) {
        return null;
      }
    },
    // 设置字典
    setDict(state, { _key, value }) {
      if (_key !== null && _key !== "") {
        state.dict.push({
          key: _key,
          value: value
        });
      }
    },
    // 删除字典
    removeDict(state, { _key }) {
      let bln = false;
      try {
        for (let i = 0; i < state.dict.length; i++) {
          if (state.dict[i].key == _key) {
            state.dict.splice(i, 1);
            return true;
          }
        }
      } catch (e) {
        bln = false;
      }
      return bln;
    },
    // 清空字典
    cleanDict(state) {
      state.dict = [];
    },
    // 初始字典
    initDict() {
    }
  },
  actions: {}
}

export default StoreModel;
