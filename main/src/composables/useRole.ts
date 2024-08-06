import { ref, reactive, watch } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { useI18n } from 'vue-i18n'

export default function useRole() {
  const { locale, t } = useI18n()

  const STATES_LOCALE = {
    'zh-CN': [{ label: '全部', value: '' }, { label: '启用', value: 0 }, { label: '暂停', value: 1 }],
    'en-US': [{ label: 'ALL', value: '' }, { label: 'Enable', value: 0 }, { label: 'Disable', value: 1 }],
    'zh-TW': [{ label: '全部', value: '' }, { label: '啟用', value: 0 }, { label: '暫停', value: 1 }],
  }
  const ROLE_KEY = {
    'superadmin': 'superadmin',
    'admin': 'admin',
    'common': 'common'
  }
  const getLocaleState = () => {
    return STATES_LOCALE[locale.value] || STATES_LOCALE['zh-CN']
  }

  const STATES = reactive<any>([])
  const ROLE_OPTIONS = Object.entries(ROLE_KEY).map(([key, value]) => ({ label: key, value: value }))
  const STATE_OPTIONS = reactive<any>([])

  getLocaleState().map(item => {
    STATES.push(item)
  })
  getLocaleState().filter(item => item.value !== '').map(item => {
    STATE_OPTIONS.push(item)
  })

  const validRole = (role) => (role in ROLE_KEY)

  watch(() => locale.value, () => {
    STATES.splice(0, STATES.length)
    getLocaleState().map(item => {
      STATES.push(item)
    })
    STATE_OPTIONS.splice(0, STATE_OPTIONS.length)
    getLocaleState().filter(item => item.value !== '').map(item => {
      STATE_OPTIONS.push(item)
    })
  })

  return {
    STATES,
    ROLE_KEY,
    ROLE_OPTIONS,
    STATE_OPTIONS,
    validRole,
  }
}
