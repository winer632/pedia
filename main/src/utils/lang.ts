export function langDict() {
  return {
    'zh-CN': 'zh-cn',
    'zh-TW': 'zh-hk',
    'en-US': 'en-us',
    'th-TH': 'th-th'
  }
}

export function getLangKey(lang: string) {
  if (lang in langDict()) {
    return langDict()[lang];
  } else {
    return 'zh-cn'
  }
}

export function getLocaleLang() {
  return 'zh-cn'
}
