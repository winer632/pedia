import type { Ref } from 'vue'
import { nextTick, ref } from 'vue'
import { ElScrollbar } from 'element-plus'

type ScrollElement = typeof ElScrollbar | null

interface ScrollReturn {
  scrollbarRef: Ref<ScrollElement>
  scrollToBottom: () => Promise<void>
  scrollToTop: () => Promise<void>
  scrollToBottomIfAtBottom: () => Promise<void>
}

export default function useScroll(): ScrollReturn {
  const scrollbarRef = ref<ScrollElement>(null)

  const scrollToBottom = async () => {
    await nextTick()
    console.error(scrollbarRef.value)
    scrollbarRef.value && console.error(scrollbarRef.value.wrapRef.scrollTop, scrollbarRef.value.wrapRef.scrollHeight)
    if (scrollbarRef.value)
      scrollbarRef.value.wrapRef.scrollTop = scrollbarRef.value.wrapRef.scrollHeight
  }

  const scrollToTop = async () => {
    await nextTick()
    if (scrollbarRef.value)
      scrollbarRef.value.wrapRef.scrollTop = 0
  }

  const scrollToBottomIfAtBottom = async () => {
    await nextTick()
    if (scrollbarRef.value) {
      const threshold = 100
      if (scrollbarRef.value.wrapRef.scrollHeight - scrollbarRef.value.wrapRef.scrollTop <= scrollbarRef.value.wrapRef.clientHeight + threshold) {
        scrollbarRef.value.wrapRef.scrollTop = scrollbarRef.value.wrapRef.scrollHeight
      }
    }
  }

  return {
    scrollbarRef,
    scrollToBottom,
    scrollToTop,
    scrollToBottomIfAtBottom
  }
}
