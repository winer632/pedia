import { ref, toRefs } from "vue";
import { useStore } from "vuex";
import { getDicts } from '@/services/system_ry/dict/data'

/**
 * 获取字典数据
 */
export function useDict(...args) {
  const res = ref({});
  return (() => {
    args.forEach((dictType, index) => {
      res.value[dictType] = [];
      const dicts = useStore().state.ry_dict.getDict(dictType);
      if (dicts) {
        res.value[dictType] = dicts;
      } else {
        getDicts(dictType).then(resp => {
          res.value[dictType] = resp.data.map(p => ({ label: p.dictLabel, value: p.dictValue, elTagType: p.listClass, elTagClass: p.cssClass }))
          useStore().state.ry_dict.setDict(dictType, res.value[dictType]);
        })
      }
    })
    return toRefs(res.value);
  })()
}
