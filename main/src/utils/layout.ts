export function adjustLayoutLeftScroll() {
  const LayoutLeft: any = window.document.documentElement
  const LayoutLeftScrollMain: any = window.document.querySelector('.qa-main-list')
  const LayoutCompareScroll: any = window.document.querySelector('.qa-main-create-compare')

  let LayoutLeftScrollHeight = LayoutLeft?.clientHeight - LayoutLeftScrollMain?.offsetTop - 48 - 16
  if (LayoutLeft?.clientWidth > 1280) {
    LayoutLeftScrollHeight = LayoutLeftScrollHeight - 48
  }
  let LayoutLeftScrollVar = 'clamp(160px, 80vh, 100vh)'
  if (LayoutLeftScrollHeight > 0) {
    LayoutLeftScrollVar = `clamp(160px, ${LayoutLeftScrollHeight}px, 100vh)`
  }

  LayoutLeftScrollMain?.style.setProperty('--left-layout-scroll', LayoutLeftScrollVar)
}

export function eventLayoutLeftScroll() {
  window.addEventListener('resize', adjustLayoutLeftScroll)
}

export function removeEventLeftScroll() {
  window.removeEventListener('resize', adjustLayoutLeftScroll)
}

export function adjustMainPreviewScroll(plusHeight = 0) {
  const LayoutLeft: any = window.document.documentElement
  const LayoutRight: any = window.document.querySelector('.main-chat-preview')
  const LayoutRightFooter: any = window.document.querySelector('.main-chat-footer')
  if (!LayoutRight) {
    return
  }

  let LayoutLeftScrollHeight = LayoutLeft?.clientHeight - 48 - 40 - plusHeight
  if (LayoutLeft?.clientWidth > 1280) {
    LayoutLeftScrollHeight = LayoutLeftScrollHeight - 48
  }
  let LayoutLeftScrollVar = 'clamp(160px, 80vh, 100vh)'
  if (LayoutLeftScrollHeight > 0) {
    LayoutLeftScrollVar = `clamp(160px, ${LayoutLeftScrollHeight}px, 100vh)`
  }
  LayoutRight?.style.setProperty('--right-main-preview-scroll', LayoutLeftScrollVar)
}

export function adjustMainRightScroll(plusHeight = 0) {
  const LayoutLeft: any = window.document.documentElement
  const LayoutLeftScrollMain: any = window.document.querySelector('.main-chat-message')
  const LayoutRightNoData: any = window.document.querySelector('.main-chat-nodata')
  const LayoutRightFooter: any = window.document.querySelector('.main-chat-footer')

  const offsetHeight = LayoutRightFooter?.offsetHeight || 86
  let LayoutLeftScrollHeight = LayoutLeft?.clientHeight - offsetHeight - 60 - 48
  if (LayoutLeft?.clientWidth > 1280) {
    LayoutLeftScrollHeight = LayoutLeftScrollHeight - 48
  }
  let LayoutLeftScrollVar = 'clamp(160px, 80vh, 100vh)'
  if (LayoutLeftScrollHeight > 0) {
    LayoutLeftScrollVar = `clamp(160px, ${LayoutLeftScrollHeight}px, 100vh)`
  }
  LayoutLeftScrollMain?.style.setProperty('--right-main-scroll', LayoutLeftScrollVar)
  LayoutLeftScrollHeight = LayoutLeftScrollHeight - 60
  LayoutLeftScrollVar = `clamp(160px, ${LayoutLeftScrollHeight}px, 100vh)`
  LayoutRightNoData?.style.setProperty('--right-main-scroll', LayoutLeftScrollVar)
  setTimeout(() => adjustMainPreviewScroll(plusHeight), 1000)
}

export function eventMainRightScroll(plusHeight = 0) {
  window.addEventListener('resize', () => adjustMainRightScroll(plusHeight))
}

export function removeEventMainScroll(plusHeight = 0) {
  window.removeEventListener('resize', () => adjustMainRightScroll(plusHeight))
}

export function adjustInputFocus() {
  const Input: any = window.document.querySelector('.main-chat-footer-input')
  Input?.style && (Input.style.borderColor = 'var(--input-footer-border-focus)')
}

export function adjustInputBlur() {
  const Input: any = window.document.querySelector('.main-chat-footer-input')
  Input?.style && (Input.style.borderColor = 'var(--input-footer-border-blur)')
}
