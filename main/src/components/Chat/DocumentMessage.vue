<template>
  <div ref="messageRef" class="chat-message" :class="props.owner === 'me' ? 'reverse' : ''">
    <div class="chat-message-header">
      <img :src="props.owner === 'me' ? '/images/GroupQ.png' : '/images/GroupA.png'" width="40" height="40" />
    </div>
    <div class="chat-message-body">
      <div class="chat-message-body-text">
        <ChatText ref="textRef" :owner="owner" :error="error" :text="reText" :loading="loading" :as-raw-text="asRawText"
          :UUID="id" @handleChunk="handleChunk" />
        <div v-if="InTopk && InTopk.length" class="chat-message-chunks">
          <div class="chunks-list" v-for="item, index in InTopk" :key="index">
            <el-tag class="chunk-index" type="primary" @click="handle(item.id)">{{ item.id }}</el-tag>
          </div>
        </div>
      </div>
      <div v-if="id" class="chat-message-footer">
        <template v-if="props.owner === 'me'">
        </template>
        <template v-else>
          <el-button type="text" @click="like">
            <template #default>
              <icon-svg v-if="!localLike" type="pk-like" class="wh18 hover"></icon-svg>
              <icon-svg v-else type="pk-liked" class="wh18"></icon-svg>
            </template>
          </el-button>
          <el-button type="text" @click="unlike">
            <template #default>
              <icon-svg v-if="!localUnlike" type="pk-unlike" class="wh18 hover"></icon-svg>
              <icon-svg v-else type="pk-unliked" class="wh18 hover"></icon-svg>
            </template>
          </el-button>
          <el-button v-if="!localFeedback" type="text" @click="feedback">
            <template #default>
              <icon-svg type="pk-feedback" class="wh18 hover"></icon-svg>
            </template>
          </el-button>
          <el-button type="text" @click="handleSelect('clipboard')">
            <template #default>
              <icon-svg v-if="!localCopied" type="pk-copy" class="wh18 hover"></icon-svg>
              <icon-svg v-else type="pk-copied" class="wh18 hover"></icon-svg>
            </template>
          </el-button>
          <div class="chat-message-footer-right">
            <div class="chat-message-footer-rightr">
              <el-button type="text" @click="handleRegenerate">{{ t('page.qa.message.regenerate') }}</el-button>
            </div>
          </div>
        </template>
      </div>
    </div>
    <el-dialog v-model="dialogFeedbackShow" :title="feedbackTitle" width="25rem">
      <el-form :model="feedbackForm" :rules="feedbackRules" ref="feedbackRef">
        <el-form-item>
          <span class="span" v-for="text in defaultTextList" :key="text" @click="defaultText(text)">{{ text }}</span>
        </el-form-item>
        <el-form-item label="" props="value">
          <el-input v-model="feedbackForm.value" type="textarea" :autosize="{ minRows: 4, maxRows: 4 }" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFeedbackShow = false">{{ t('page.qa.main.cancelButton') }}</el-button>
          <el-button type="primary" @click="feedbackSubmit">{{ t('page.qa.main.submitButton') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, reactive, defineProps, defineEmits, onMounted, onUnmounted } from 'vue'
import { ElForm, ElButton, ElMessage } from 'element-plus'
import { copyToClip } from '@/utils/clipboard'
import ChatText from './Text.vue'
import { putLike, putUnlike, putFeedback, putCompareFeedback } from '@/views/document/service'
import IconSvg from '@/components/IconSvg'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  id?: number;
  createdAt?: string
  text?: string
  conversationType?: string
  owner?: string
  error?: boolean
  loading?: boolean
  like?: boolean
  unlike?: boolean
  feedback?: boolean
  topk?: string
}

interface Emits {
  (ev: 'regenerate'): void
  (ev: 'handleClick', id: number): void
  (ev: 'delete'): void
  (ev: 'like', id: number): void
  (ev: 'unlike', id: number): void
  (ev: 'feedback', id: number, payload: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const asRawText = ref(props.owner === 'me')
const messageRef = ref<HTMLElement | null>(null)
const dialogFeedbackShow = ref(false)
const feedbackTitle = ref(t('page.qa.message.feedback'))
const defaultTextList = ref(t('page.qa.message.feedbackList').split(','))
const feedbackRef = ref<typeof ElForm | null>(null)
const feedbackForm = reactive({
  value: ''
})

const feedbackRules = reactive({
  value: [{ required: true, message: t('page.qa.message.feedbackPlaceholder'), trigger: 'blur' }]
})

const chunkArray = computed(() => {
  const match = props.text?.match(/(\[)ref_\d+(\])/g)
  if (match) {
    return [...new Set(match)]
  }
  const matchN = props.text?.match(/chunk id \d+/g)
  if (matchN) {
    return [...new Set(matchN)]
  }

  return []
})
const chunkText = computed(() => {
  return chunkArray.value.map(item => {
    return Number(item.replaceAll(/[^0-9]/ig, ''))
  })
})
const JSONTopk = computed(() => {
  try {
    return Object.values(JSON.parse(props.topk))
  } catch (error) {
    console.log(error)
  }
  return []
})
const InTopk = computed(() => {
  const merge = []
  for (let inNu = 0; inNu < chunkText.value.length; inNu++) {
    const indx = Number(chunkText.value[inNu])
    if (JSONTopk.value[indx - 1]) {
      merge.push({
        id: inNu + 1,
        nu: indx,
        ...JSONTopk.value[indx - 1]
      })
    }
  }
  return merge
})
const reText = computed(() => {
  let text = props.text?.replaceAll('<br/>', '\n') || t('page.qa.answer.error')
  const match = text.match(/(\n.*\[\d+\]+.*$)/g)
  if (match && match.length > 0) {
    text = text.replace(match[0], '')
  }
  for (let index = 0; index < InTopk.value.length; index++) {
    const title = ''
    text = text.replaceAll(`[ref_${InTopk.value[index].nu}]`, `<span class="el-index" data-title="${title}" data-id="${index}">${InTopk.value[index].id}</span>`)
  }
  return text.replace(/\[ref_\d+\]/g, '')
})
const rawText = computed(() => {
  let text = props.text?.replaceAll('<br/>', '\n') || t('page.qa.answer.error')
  return text.replace(/\[ref_\d+\]/g, '')
})
const localLike = computed(() => props.like)
const localUnlike = computed(() => props.unlike)
const localFeedback = computed(() => props.feedback)
const localCopied = computed(() => false)

const handle = async (index: number) => {
  const doc = InTopk.value.find(item => item.id = index)
  emit('handleClick', doc)
}

const like = async () => {
  if (props.id && !props.like) {
    const putLocale = props.conversationType === 'compare' ? putCompareFeedback : putLike
    await putLocale({ id: props.id, score: 1 })
    emit('like', props.id)
    ElMessage.success(t('page.qa.main.likeSuccess'))
  }
}

const unlike = async () => {
  if (props.id && !props.unlike) {
    const putLocale = props.conversationType === 'compare' ? putCompareFeedback : putUnlike
    await putLocale({ id: props.id, score: 2 })
    emit('unlike', props.id)
    ElMessage.success(t('page.qa.main.globalSuccess'))
  }
}

const feedback = async () => {
  if (props.id && !props.feedback) {
    dialogFeedbackShow.value = true
  }
  feedbackForm.value = ''
}

const feedbackSubmit = async () => {
  try {
    const valid = feedbackRef.value?.validate()
    if (!valid) return
    const putLocale = props.conversationType === 'compare' ? putCompareFeedback : putFeedback
    await putLocale({ id: props.id, comment: feedbackForm.value })
    emit('feedback', props.id || 0, feedbackForm.value)
    ElMessage.success(t('page.qa.main.submitSuccess'))
    dialogFeedbackShow.value = false
  } catch (error) {
    dialogFeedbackShow.value = false
    console.log(error)
  }
}

const asText = async () => {
  asRawText.value = !asRawText.value
}

const defaultText = (text: string) => {
  feedbackForm.value = text
}

const handleSelect = (key: 'clipboard' | 'delete' | 'asText') => {
  switch (key) {
    case 'clipboard':
      handleClipboard()
      break
    case 'delete':
      emit('delete')
      break
    case 'asText':
      asRawText.value = !asRawText.value
      break
  }
}

const handleRegenerate = () => {
  messageRef.value?.scrollIntoView()
  emit('regenerate')
}

const handleChunk = async (index: number, id: number) => {
  const doc = InTopk.value[index]
  emit('handleClick', doc)
}

const handleClipboard = async () => {
  try {
    await copyToClip(rawText.value || '')
    ElMessage.success(t('page.qa.main.copySuccess'))
  } catch (error) {
    ElMessage.error(t('page.qa.main.copyError'))
  }
}

onMounted(async () => {

})
</script>
<style lang="scss" scoped>
::v-deep(.el-textarea__inner) {
  color: var(--theme-color-text);
}

.chat-message {
  display: flex;
  margin-top: 0.625rem;
  gap: 0.625rem;

  &-header {
    display: flex;
  }

  &-body {
    display: flex;
    max-width: 38.875rem;
    flex-direction: column;

    .chat-message-footer {
      display: flex;
      gap: 0.625rem;

      ::v-deep(.el-button) {
        margin-left: 0;
      }

      &-right {
        width: 100%;

        .chat-message-footer-rightr {
          ::v-deep(.el-button) {
            color: var(--theme-color-huge);
            font-size: 0.75rem;
            font-style: normal;
            font-weight: 400;
          }

          color: var(--theme-color-huge);
          display: flex;
          justify-content: flex-end;
        }
      }
    }

    .chat-message-chunks {
      display: flex;
      gap: 0.625rem;

      .chunks-list {
        display: flex;
        gap: 0.625rem;
      }

      .chunk-index {
        color: #4E5969;
        cursor: pointer;
        width: 1rem;
        height: 1rem;
        font-size: 0.75rem;
        font-style: normal;
        font-weight: 400;
      }
    }
  }

  .wh18 {
    width: 1.125rem;
    height: 1.125rem;
  }

  .hover {
    &:hover {
      color: var(--theme-color-huge);
      background: var(--theme-bg-colorHover);
    }
  }

  .span {
    margin-top: 0.375rem;
    margin-right: 1.25rem;
    color: var(--theme-color-font);
    border-radius: 0.25rem;
    background: var(--theme-bg-colorSpan);
    padding: 0.375rem 0.375rem;

    &:hover {
      color: var(--theme-color-huge);
      border-radius: 0.25rem;
      background: var(--theme-bg-colorHover);
    }
  }
}

.chat-message.reverse {
  flex-direction: row-reverse;
}
</style>
