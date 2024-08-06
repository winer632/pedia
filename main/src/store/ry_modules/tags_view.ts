import { Mutation, Action } from 'vuex';
import { StoreModuleType } from "@/utils/store";

export interface StateType {
  views: Array<any>;
  cachedViews: Array<any>;
  iframeViews: Array<any>;
}

export interface ModuleType extends StoreModuleType<StateType> {
  state: StateType;
  mutations: {
    addCachedView: Mutation<StateType>;
    addIframeView: Mutation<StateType>;
    removeView?: Mutation<StateType>;
    removeCachedView?: Mutation<StateType>;
    removeIframeView?: Mutation<StateType>;
    addVisibleView: Mutation<StateType>;
    delVisibleView: Mutation<StateType>;
    delIframeView: Mutation<StateType>;
    delCachedView: Mutation<StateType>;
    delOtherVisibleView: Mutation<StateType>;
    delAllVisibleView: Mutation<StateType>;
    delAllCachedView: Mutation<StateType>;
    updateVisibleView: Mutation<StateType>;
    delRightTags: Mutation<StateType>;
    delLeftTags: Mutation<StateType>;
  };
  actions: {
    addView: Action<StateType, StateType>;
    delView: Action<StateType, StateType>;
    delOthersViews: Action<StateType, StateType>;
    delAllViews: Action<StateType, StateType>;
  }
}

const initState: StateType = {
  views: [],
  cachedViews: [],
  iframeViews: [],
}

const StoreModel: ModuleType = {
  namespaced: true,
  name: 'ry_tags_view',
  state: {
    ...initState
  },
  mutations: {
    addIframeView(state, { view }) {
      if (state.iframeViews.some(v => v.path === view.path)) return
      state.iframeViews.push(
        Object.assign({}, view, {
          title: view.meta.title || 'no-name'
        })
      )
    },
    addVisibleView(state, { view }) {
      if (state.views.some(v => v.path === view.path)) return
      state.views.push(
        Object.assign({}, view, {
          title: view.meta.title || 'no-name'
        })
      )
    },
    addCachedView(state, { view }) {
      if (state.cachedViews.includes(view.name)) return
      if (!view.meta.noCache) {
        state.cachedViews.push(view.name)
      }
    },
    delVisibleView(state, { view }) {
      return new Promise(resolve => {
        for (const [i, v] of state.views.entries()) {
          if (v.path === view.path) {
            state.views.splice(i, 1)
            break
          }
        }
        state.iframeViews = state.iframeViews.filter(item => item.path !== view.path)
        resolve([...state.views])
      })
    },
    delIframeView(state, { view }) {
      return new Promise(resolve => {
        state.iframeViews = state.iframeViews.filter(item => item.path !== view.path)
        resolve([...state.iframeViews])
      })
    },
    delCachedView(state, { view }) {
      return new Promise(resolve => {
        const index = state.cachedViews.indexOf(view.name)
        index > -1 && state.cachedViews.splice(index, 1)
        resolve([...state.cachedViews])
      })
    },
    delOtherVisibleView(state, { view }) {
      return new Promise(resolve => {
        state.views = state.views.filter(v => {
          return v.meta.affix || v.path === view.path
        })
        state.iframeViews = state.iframeViews.filter(item => item.path === view.path)
        resolve([...state.views])
      })
    },
    delAllVisibleView(state, { view }) {
      return new Promise(resolve => {
        const affixTags = state.views.filter(tag => tag.meta.affix)
        state.views = affixTags
        state.iframeViews = []
        resolve([...state.views])
      })
    },
    delAllCachedView(state, { view }) {
      return new Promise(resolve => {
        state.cachedViews = []
        resolve([...state.cachedViews])
      })
    },
    updateVisibleView(state, { view }) {
      for (let v of state.views) {
        if (v.path === view.path) {
          v = Object.assign(v, view)
          break
        }
      }
    },
    delRightTags(state, { view }) {
      return new Promise(resolve => {
        const index = state.views.findIndex(v => v.path === view.path)
        if (index === -1) {
          return
        }
        state.views = state.views.filter((item, idx) => {
          if (idx <= index || (item.meta && item.meta.affix)) {
            return true
          }
          const i = state.cachedViews.indexOf(item.name)
          if (i > -1) {
            state.cachedViews.splice(i, 1)
          }
          if (item.meta.link) {
            const fi = state.iframeViews.findIndex(v => v.path === item.path)
            state.iframeViews.splice(fi, 1)
          }
          return false
        })
        resolve([...state.views])
      })
    },
    delLeftTags(state, { view }) {
      return new Promise(resolve => {
        const index = state.views.findIndex(v => v.path === view.path)
        if (index === -1) {
          return
        }
        state.views = state.views.filter((item, idx) => {
          if (idx >= index || (item.meta && item.meta.affix)) {
            return true
          }
          const i = state.cachedViews.indexOf(item.name)
          if (i > -1) {
            state.cachedViews.splice(i, 1)
          }
          if (item.meta.link) {
            const fi = state.iframeViews.findIndex(v => v.path === item.path)
            state.iframeViews.splice(fi, 1)
          }
          return false
        })
        resolve([...state.views])
      })
    }
  },
  actions: {
    addView({ commit }, { view }) {
      commit('addVisibleView', view)
      commit('addCachedView', view)
    },
    delView({ commit }, { view }) {
      commit('delVisibleView', view)
      commit('delCachedView', view)
    },
    delOthersViews({ commit }, { view }) {
      commit('delOtherVisibleView', view)
      commit('delOthersCachedViews', view)
    },
    delAllViews({ commit }, { view }) {
      commit('delAllVisibleView', view)
      commit('delAllCachedView', view)
    },

  }
}

export default StoreModel;
