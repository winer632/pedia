import { ref, watch } from 'vue'
import { queryDocument, postDocument, summary } from '@/views/document/service'
import { ElMessage, ElLoading } from 'element-plus'
import { useStore } from "vuex";
import { useI18n } from 'vue-i18n'
import { langDict, getLangKey, getLocaleLang } from '@/utils/lang'
import { promptList as queryPrompt } from '@/views/qa/service'

export default function usePrompt(loadPrompt) {
  const { locale, t } = useI18n()
  const defaultLang = ref(getLocaleLang())
  defaultLang.value = getLangKey(locale.value)

  watch(locale, async () => {
    defaultLang.value = getLangKey(locale.value)
    await loadPrompt(defaultLang.value)
  })

  return {
    defaultLang
  }
}

export function useWelcome(loadWelcome) {
  const { locale, t } = useI18n()
  const defaultLang = ref(getLocaleLang())
  defaultLang.value = getLangKey(locale.value)

  watch(locale, async () => {
    defaultLang.value = getLangKey(locale.value)
    await loadWelcome(defaultLang.value)
  })

  return {
    defaultLang
  }
}
