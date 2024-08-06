import { reactive, watch } from 'vue'
import { useI18n } from "vue-i18n"
export default function useState() {
  const { locale } = useI18n();

  const outputLangs = {
    'zh-CN': [
      { value: 'zh-cn', label: '简体中文' },
      { value: 'zh-tw', label: '繁体中文' },
      { value: 'en-us', label: '英文' },
    ],
    'zh-TW': [
      { value: 'zh-cn', label: '简体中文' },
      { value: 'zh-tw', label: '繁体中文' },
      { value: 'en-us', label: 'English' },
    ],
    'en-US': [
      { value: 'zh-cn', label: 'Chinese (Simplified)' },
      { value: 'zh-tw', label: 'Chinese (Traditional)' },
      { value: 'en-us', label: 'English' },
    ],
    'th-TH': [
      { value: 'zh-cn', label: '简体中文' },
      { value: 'zh-tw', label: '繁体中文' },
      { value: 'en-us', label: 'English' },
    ],
  }
  const defaultLocale = 'zh-CN'
  const LANGS_LOCALE = {
    'zh-CN': {
      'zh-cn': '简体中文',
      'zh-hk': '繁体中文',
      'en-us': 'English',
    },
    'zh-TW': {
      'zh-cn': '簡體中文',
      'zh-hk': '繁體中文',
      'en-us': 'English',
    },
    'en-US': {
      'zh-cn': 'Chinese (Simplified)',
      'zh-hk': 'Chinese (Traditional)',
      'en-us': 'English',
    }
  }
  const TYPES_LOCALE = {
    'zh-CN': {
      0: '文本类型', 1: '文本类型', 2: 'QA类型'
    },
    'zh-TW': {
      0: '文本類型', 1: '文本類型', 2: 'QA類型'
    },
    'en-US': {
      0: 'Text', 1: 'Text', 2: 'Q&A'
    }
  }
  const STATE_PREV = {
    'DOCUMENT_WAIT_CONFIRM': 1,
    'DOCUMENT_WAIT_PUBLISH': 2,
    'DOCUMENT_PUBLISHED': 3,
    'DOCUMENT_STOP': 4,
    'DOCUMENT_DUPL': 5,
    'DOCUMENT_PUBLISH_FAILED': 6,
    'DOCUMENT_PUBLISH_ING': 7
  }
  const STATE_NEXT = {
    'NOT_READY': 0,
    'START': 1,
    'RUNNING': 2,
    'READY': 3,
    'ERROR': 4,
    'SPLIT': 5,
    'SPLIT_ERROR': 6,
    'TOKEN_EXCEED': 7,
    'TOKEN_LIMIT': 8,
  }
  const STATUS_LOCALE = {
    'zh-CN': [
      '上传中',
      '待解析',
      '解析中',
      '解析失败',
      '待校验',
      '待上架',
      '已上架',
      '上架中',
      '上架失败',
      '其他'
    ],
    'zh-TW': [
      '上傳中',
      '待解析',
      '解析中',
      '解析失败',
      '待校验',
      '待上架',
      '已上架',
      '上架中',
      '上架失敗',
      '其他'
    ],
    'en-US': [
      'Uploading',
      'Wait Parsing',
      'Parsing',
      'Parsing Failed',
      'Awaiting Verification',
      'Awaiting Publish',
      'Published',
      'Publishing',
      'Publish Failed',
      'Others'

    ]
  }
  const SCOPE_LOCALE = {
    'zh-CN': [
      '', '通用问答', '文档问答前', '文档问答后', '知识库问答'
    ],
    'zh-TW': [
      '', '通用問答', '文檔問答前', '文檔問答後', '知識庫問答'
    ],
    'en-US': [
      '', 'General Chat', 'Document Chat - Before Upload', 'Document Chat - After Upload', 'Knowledge Base Chat'
    ]
  }
  const LANG_OPTIONS = {
    'zh-CN': [
      { label: '全部', value: 'ALL' },
      { label: '简体中文', value: 'zh-cn' }, { label: '繁体中文', value: 'zh-hk' },
      { label: '英文', value: 'en-us' },
    ],
    'zh-TW': [
      { label: '全部', value: 'ALL' },
      { label: '簡體中文', value: 'zh-cn' }, { label: '繁體中文', value: 'zh-hk' },
      { label: '英文', value: 'en-us' },
    ],
    'en-US': [
      { label: 'ALL', value: 'ALL' },
      { label: 'Chinese (Simplified)', value: 'zh-cn' }, { label: 'Chinese (Traditional)', value: 'zh-hk' },
      { label: 'English', value: 'en-us' },
    ]
  }
  const TYPE_OPTIONS = {
    'zh-CN': [
      { label: '全部', value: 'ALL' },
      { label: '文本类型', value: '1' }, { label: 'QA类型', value: '2' },
    ],
    'zh-TW': [
      { label: '全部', value: 'ALL' },
      { label: '文本類型', value: '1' }, { label: 'QA類型', value: '2' },
    ],
    'en-US': [
      { label: 'ALL', value: 'ALL' },
      { label: 'Text', value: '1' }, { label: 'QA', value: '2' },
    ]
  }
  const STATUS_OPTIONS = {
    'zh-CN': [
      { label: '全部', value: 0 },
      { label: '待解析', value: 1 },
      { label: '解析中', value: 2 }, { label: '解析失败', value: 3 },
      { label: '待校验', value: 4 },
      { label: '待上架', value: 5 },
      { label: '已上架', value: 6 },
      { label: '上架中', value: 7 },
      { label: '上架失败', value: 8 }
    ],
    'zh-TW': [
      { label: '全部', value: 0 },
      { label: '待解析', value: 1 },
      { label: '解析中', value: 2 }, { label: '解析失敗', value: 3 },
      { label: '待校驗', value: 4 },
      { label: '待上架', value: 5 },
      { label: '已上架', value: 6 },
      { label: '上架中', value: 7 },
      { label: '上架失敗', value: 8 }
    ],
    'en-US': [
      { label: 'All', value: 0 },
      { label: 'Wait Parsing', value: 1 },
      { label: 'Parsing', value: 2 }, { label: 'Parse Failed', value: 3 },
      { label: 'Awaiting Verification', value: 4 },
      { label: 'Awaiting Publish', value: 5 },
      { label: 'Published', value: 6 },
      { label: 'Publishing', value: 7 },
      { label: 'Published Failed', value: 8 }
    ]
  }
  const SCOPE_OPTIONS = {
    'zh-CN': [
      { label: '全部', value: 0 },
      { label: '通用问答', value: 1 },
      { label: '单文档问答前', value: 2 },
      { label: '单文档问答后', value: 3 },
      { label: '知识库问答', value: 4 },
      { label: '文档问答 - 文档对比', value: 5 }
    ],
    'zh-TW': [
      { label: '全部', value: 0 },
      { label: '通用問答', value: 1 },
      { label: '單文檔問答前', value: 2 },
      { label: '單文檔問答後', value: 3 },
      { label: '知識庫問答', value: 4 },
      { label: '文檔問答 - 文檔對比', value: 5 }
    ],
    'en-US': [
      { label: 'All', value: 0 },
      { label: 'General Chat', value: 1 },
      { label: 'Document Chat - Before Upload', value: 2 },
      { label: 'Document Chat - After Upload', value: 3 },
      { label: 'Knowledge Base Chat', value: 4 },
      { label: 'Document Chat - Document Comparison', value: 5 }
    ]
  }

  const getLocaleOutputLang = () => {
    if (locale.value in outputLangs) {
      return outputLangs[locale.value]
    }
    return outputLangs[defaultLocale]
  }

  const getLocaleLangs = () => {
    if (locale.value in LANGS_LOCALE) {
      return LANGS_LOCALE[locale.value]
    }
    return LANGS_LOCALE[defaultLocale]
  }

  const getLocaleLangOptions = () => {
    if (locale.value in LANG_OPTIONS) {
      return LANG_OPTIONS[locale.value]
    }
    return LANG_OPTIONS[defaultLocale]
  }

  const getLocaleTypes = () => {
    if (locale.value in TYPES_LOCALE) {
      return TYPES_LOCALE[locale.value]
    }
    return TYPES_LOCALE[defaultLocale]
  }

  const getLocaleTypeOptions = () => {
    if (locale.value in TYPE_OPTIONS) {
      return TYPE_OPTIONS[locale.value]
    }
    return TYPE_OPTIONS[defaultLocale]
  }

  const getLocaleStatus = () => {
    if (locale.value in STATUS_LOCALE) {
      return STATUS_LOCALE[locale.value]
    }
    return STATUS_LOCALE[defaultLocale]
  }

  const getLocaleStatusOptions = () => {
    if (locale.value in STATUS_OPTIONS) {
      return STATUS_OPTIONS[locale.value]
    }
    return STATUS_OPTIONS[defaultLocale]
  }

  const getLocaleScopes = () => {
    if (locale.value in SCOPE_LOCALE) {
      return SCOPE_LOCALE[locale.value]
    }
    return SCOPE_LOCALE[defaultLocale]
  }

  const getLocaleScopeOptions = () => {
    if (locale.value in SCOPE_OPTIONS) {
      return SCOPE_OPTIONS[locale.value]
    }
    return SCOPE_OPTIONS[defaultLocale]
  }

  const translateState = (statePrev: number, stateNext: number) => {
    statePrev = ~~statePrev
    stateNext = ~~stateNext
    if (stateNext === STATE_NEXT.NOT_READY) {
      return 0
    } else if (stateNext <= STATE_NEXT.START) {
      return 1
    } else if (stateNext === STATE_NEXT.RUNNING) {
      return 2
    } else if (stateNext === STATE_NEXT.ERROR) {
      return 3
    } else if (stateNext >= STATE_NEXT.READY) {
      if (statePrev === STATE_PREV.DOCUMENT_WAIT_CONFIRM) {
        return 4
      } else if (statePrev === STATE_PREV.DOCUMENT_WAIT_PUBLISH) {
        return 5
      } else if (statePrev === STATE_PREV.DOCUMENT_PUBLISHED) {
        return 6
      } else if (statePrev === STATE_PREV.DOCUMENT_STOP) {
        return 5
      } else if (statePrev === STATE_PREV.DOCUMENT_PUBLISH_ING) {
        return 7
      } else if (statePrev === STATE_PREV.DOCUMENT_PUBLISH_FAILED) {
        return 8
      }
    }
    return 3
  }

  const queryState = (state: number) => {
    if (state === 1) {
      return {
        parserStates: STATE_NEXT.START,
        states: '',
      }
    } else if (state === 2) {
      return {
        parserStates: STATE_NEXT.RUNNING,
        states: '',
      }
    } else if (state === 3) {
      return {
        parserStates: STATE_NEXT.ERROR + ',' + STATE_NEXT.SPLIT_ERROR + ',' + STATE_NEXT.TOKEN_EXCEED + ',' + STATE_NEXT.TOKEN_LIMIT,
        states: '',
      }
    } else if (state === 4) {
      return {
        parserStates: STATE_NEXT.READY + ',' + STATE_NEXT.SPLIT,
        states: STATE_PREV.DOCUMENT_WAIT_CONFIRM
      }
    } else if (state === 5) {
      return {
        parserStates: '',
        states: STATE_PREV.DOCUMENT_WAIT_PUBLISH + ',' + STATE_PREV.DOCUMENT_STOP
      }
    } else if (state === 6) {
      return {
        parserStates: '',
        states: STATE_PREV.DOCUMENT_PUBLISHED
      }
    } else if (state === 7) {
      return {
        parserStates: '',
        states: STATE_PREV.DOCUMENT_PUBLISH_ING
      }
    } else if (state === 8) {
      return {
        parserStates: '',
        states: STATE_PREV.DOCUMENT_PUBLISH_FAILED
      }
    }

    return {}
  }

  const STATES = reactive<any>([])
  const TYPES = reactive<any>({})
  const LANGS = reactive<any>({})
  const SCOPES = reactive<any>({})
  const LangOptions = reactive<any>([])
  const StatusOptions = reactive<any>([])
  const TypeOptions = reactive<any>([])
  const ScopeOptions = reactive<any>([])

  getLocaleStatus().map(item => {
    STATES.push(item)
  })
  Object.keys(getLocaleTypes()).map(item => {
    TYPES[item] = getLocaleTypes()[item]
  })
  Object.keys(getLocaleLangs()).map(item => {
    LANGS[item] = getLocaleLangs()[item]
  })
  Object.keys(getLocaleScopes()).map(item => {
    SCOPES[item] = getLocaleScopes()[item]
  })
  getLocaleStatusOptions().map(item => {
    StatusOptions.push(item)
  })
  getLocaleLangOptions().map(item => {
    LangOptions.push(item)
  })
  getLocaleTypeOptions().map(item => {
    TypeOptions.push(item)
  })
  getLocaleScopeOptions().map(item => {
    ScopeOptions.push(item)
  })

  watch(() => locale.value, () => {
    STATES.splice(0, STATES.length)
    getLocaleStatus().map(item => {
      STATES.push(item)
    })
    Object.keys(TYPES).map(item => {
      TYPES[item] = getLocaleTypes()[item]
    })
    Object.keys(LANGS).map(item => {
      LANGS[item] = getLocaleLangs()[item]
    })
    StatusOptions.splice(0, StatusOptions.length)
    getLocaleStatusOptions().map(item => {
      StatusOptions.push(item)
    })
    LangOptions.splice(0, LangOptions.length)
    getLocaleLangOptions().map(item => {
      LangOptions.push(item)
    })
    TypeOptions.splice(0, TypeOptions.length)
    getLocaleTypeOptions().map(item => {
      TypeOptions.push(item)
    })
    ScopeOptions.splice(0, ScopeOptions.length)
    getLocaleScopeOptions().map(item => {
      ScopeOptions.push(item)
    })
  })
  return {
    getLocaleOutputLang,
    getLocaleLangs,
    getLocaleTypes,
    getLocaleStatus,
    getLocaleLangOptions,
    getLocaleTypeOptions,
    getLocaleStatusOptions,
    translateState,
    queryState,
    STATES,
    TYPES,
    LANGS,
    SCOPES,
    StatusOptions,
    LangOptions,
    TypeOptions,
    ScopeOptions,
    STATE_PREV,
    STATE_NEXT,
  }
}
